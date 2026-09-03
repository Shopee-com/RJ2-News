import { supabase } from '@/lib/supabase'

export type QuizStatus = 'draft' | 'scheduled' | 'published'

export interface Quiz {
  id: string
  title: string
  description: string | null
  status: QuizStatus
  publish_at: string | null
  created_at?: string
}

export interface QuizQuestion {
  id?: string
  quiz_id?: string
  ord: number
  question: string
  options: string[]
  correct_index: number
  explanation?: string | null
}

export interface TakingQuestion {
  id: string
  ord: number
  question: string
  options: string[]
}

export interface QuizForTaking {
  quiz: { id: string; title: string; description: string | null }
  questions: TakingQuestion[]
  attempt: { score: number; total: number } | null
}

export interface SubmitResult {
  score: number
  total: number
  results: { question_id: string; correct_index: number; selected_index: number | null; is_correct: boolean }[]
}

export interface QuizAttempt {
  id: string
  user_id: string
  name: string | null
  operation: string | null
  locality: string | null
  opsid: string | null
  score: number
  total: number
  created_at: string
}

// ---------------------------------------------------------------------------
// Público (usuário)
// ---------------------------------------------------------------------------
export async function listPublishedQuizzes(): Promise<Quiz[]> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .order('publish_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Quiz[]
}

export async function fetchMyAttempts(): Promise<Record<string, { score: number; total: number }>> {
  const { data, error } = await supabase.from('quiz_attempts').select('quiz_id,score,total')
  if (error) throw error
  const map: Record<string, { score: number; total: number }> = {}
  for (const a of data ?? []) map[(a as any).quiz_id] = { score: (a as any).score, total: (a as any).total } // eslint-disable-line @typescript-eslint/no-explicit-any
  return map
}

export async function getQuizForTaking(id: string): Promise<QuizForTaking | null> {
  const { data, error } = await supabase.rpc('get_quiz_for_taking', { p_quiz_id: id })
  if (error) throw error
  return (data as QuizForTaking) ?? null
}

export async function submitQuiz(
  id: string,
  answers: { question_id: string; selected_index: number | null }[],
): Promise<SubmitResult> {
  const { data, error } = await supabase.rpc('submit_quiz', { p_quiz_id: id, p_answers: answers })
  if (error) throw error
  return data as SubmitResult
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------
export async function fetchAllQuizzes(): Promise<Quiz[]> {
  const { data, error } = await supabase.from('quizzes').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Quiz[]
}

export async function fetchQuiz(id: string): Promise<Quiz | null> {
  const { data, error } = await supabase.from('quizzes').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return (data as Quiz) ?? null
}

export async function createQuiz(): Promise<Quiz> {
  const { data, error } = await supabase
    .from('quizzes')
    .insert({ title: 'Novo quiz', status: 'draft', publish_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw error
  return data as Quiz
}

export async function updateQuiz(id: string, patch: Partial<Quiz>): Promise<Quiz> {
  const { id: _omit, created_at, ...clean } = patch
  void _omit
  void created_at
  const { data, error } = await supabase.from('quizzes').update(clean).eq('id', id).select().single()
  if (error) throw error
  return data as Quiz
}

export async function deleteQuiz(id: string): Promise<void> {
  const { error } = await supabase.from('quizzes').delete().eq('id', id)
  if (error) throw error
}

export async function fetchQuestions(quizId: string): Promise<QuizQuestion[]> {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('ord')
  if (error) throw error
  return (data ?? []) as QuizQuestion[]
}

/** Substitui todas as perguntas do quiz pelas informadas. */
export async function saveQuestions(quizId: string, questions: QuizQuestion[]): Promise<void> {
  const { error: delErr } = await supabase.from('quiz_questions').delete().eq('quiz_id', quizId)
  if (delErr) throw delErr
  if (questions.length === 0) return
  const rows = questions.map((q, i) => ({
    quiz_id: quizId,
    ord: i,
    question: q.question,
    options: q.options,
    correct_index: q.correct_index,
    explanation: q.explanation ?? null,
  }))
  const { error } = await supabase.from('quiz_questions').insert(rows)
  if (error) throw error
}

export interface AttemptAnswer {
  question_id: string
  selected_index: number | null
  is_correct: boolean
}

export async function fetchAttemptAnswers(attemptId: string): Promise<AttemptAnswer[]> {
  const { data, error } = await supabase
    .from('quiz_answers')
    .select('question_id,selected_index,is_correct')
    .eq('attempt_id', attemptId)
  if (error) throw error
  return (data ?? []) as AttemptAnswer[]
}

export async function fetchAttempts(quizId: string): Promise<QuizAttempt[]> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('quiz_id', quizId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as QuizAttempt[]
}

// ---------------------------------------------------------------------------
// CSV -> perguntas
// pergunta;opcao1;opcao2;...;correta   (correta = número 1-based)
// ---------------------------------------------------------------------------
export function parseQuizCsv(text: string): QuizQuestion[] {
  const rows = parseCsv(text)
  if (rows.length === 0) return []
  // remove cabeçalho se a última coluna não for número
  let start = 0
  const firstLast = rows[0][rows[0].length - 1]?.trim()
  if (firstLast && isNaN(Number(firstLast))) start = 1

  const questions: QuizQuestion[] = []
  for (let i = start; i < rows.length; i++) {
    const cols = rows[i].map((c) => c.trim())
    if (cols.length < 3 || !cols[0]) continue
    const correctRaw = cols[cols.length - 1]
    const options = cols.slice(1, cols.length - 1).filter((o) => o !== '')
    const correct = Number(correctRaw)
    if (options.length < 2 || isNaN(correct)) continue
    questions.push({
      ord: questions.length,
      question: cols[0],
      options,
      correct_index: Math.max(0, Math.min(options.length - 1, correct - 1)),
    })
  }
  return questions
}

// CSV parser simples com suporte a aspas e delimitador ; ou ,
function parseCsv(text: string): string[][] {
  const delimiter = (text.match(/;/g)?.length ?? 0) >= (text.match(/,/g)?.length ?? 0) ? ';' : ','
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ } else inQuotes = false
      } else field += c
    } else if (c === '"') inQuotes = true
    else if (c === delimiter) { row.push(field); field = '' }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = '' }
    else if (c === '\r') { /* ignora */ }
    else field += c
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row) }
  return rows.filter((r) => r.some((c) => c.trim() !== ''))
}
