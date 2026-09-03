import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { AuthProvider } from '@/lib/auth'
import Layout from '@/components/layout/Layout'
import RequireAccess from '@/components/auth/RequireAccess'
import RequireAdmin from '@/components/auth/RequireAdmin'

// Páginas carregadas sob demanda (code-splitting por rota):
// cada uma vira um chunk separado, baixado só quando a rota é aberta.
const Home = lazy(() => import('@/pages/Home'))
const Pop = lazy(() => import('@/pages/Pop'))
const PopDetail = lazy(() => import('@/pages/PopDetail'))
const Dados = lazy(() => import('@/pages/Dados'))
const Reverser = lazy(() => import('@/pages/Reverser'))
const JornalReversa = lazy(() => import('@/pages/JornalReversa'))
const JourneyStepDetail = lazy(() => import('@/pages/JourneyStepDetail'))
const Novidades = lazy(() => import('@/pages/Novidades'))
const NewsDetail = lazy(() => import('@/pages/NewsDetail'))
const Time = lazy(() => import('@/pages/Time'))
const PersonDetail = lazy(() => import('@/pages/PersonDetail'))
const Vagas = lazy(() => import('@/pages/Vagas'))
const JobDetail = lazy(() => import('@/pages/JobDetail'))
const Busca = lazy(() => import('@/pages/Busca'))
const ProjectDetail = lazy(() => import('@/pages/ProjectDetail'))
const Quiz = lazy(() => import('@/pages/Quiz'))
const Login = lazy(() => import('@/pages/Login'))
const Signup = lazy(() => import('@/pages/Signup'))
const ApproveLogin = lazy(() => import('@/pages/ApproveLogin'))
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/ResetPassword'))
const Perfil = lazy(() => import('@/pages/Perfil'))
const AdminHome = lazy(() => import('@/pages/admin/AdminHome'))
const AdminEditions = lazy(() => import('@/pages/admin/AdminEditions'))
const AdminEditionEdit = lazy(() => import('@/pages/admin/AdminEditionEdit'))
const AdminCollection = lazy(() => import('@/pages/admin/AdminCollection'))
const AdminRecordEdit = lazy(() => import('@/pages/admin/AdminRecordEdit'))
const AdminAccess = lazy(() => import('@/pages/admin/AdminAccess'))
const AdminQuizzes = lazy(() => import('@/pages/admin/AdminQuizzes'))
const AdminQuizEdit = lazy(() => import('@/pages/admin/AdminQuizEdit'))
const AdminQuizResults = lazy(() => import('@/pages/admin/AdminQuizResults'))
const AdminNav = lazy(() => import('@/pages/admin/AdminNav'))
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'))
const AdminPassword = lazy(() => import('@/pages/admin/AdminPassword'))
const NotFound = lazy(() => import('@/pages/NotFound'))

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 size={28} className="animate-spin text-orange" />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={basename}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Fora do portal (sem login) */}
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Signup />} />
            <Route path="/aprovar" element={<ApproveLogin />} />
            <Route path="/esqueci" element={<ForgotPassword />} />
            <Route path="/redefinir" element={<ResetPassword />} />

            {/* Portal fechado: exige login + aprovação */}
            <Route
              element={
                <RequireAccess>
                  <Layout />
                </RequireAccess>
              }
            >
              <Route index element={<Home />} />

              <Route path="pop" element={<Pop />} />
              <Route path="pop/:id" element={<PopDetail />} />

              <Route path="dados" element={<Dados />} />
              <Route path="projetos/:id" element={<ProjectDetail />} />

              <Route path="reverser" element={<Reverser />} />

              {/* Aba "Jornada Reversa" no formato de jornal (edições) */}
              <Route path="jornada" element={<JornalReversa />} />
              <Route path="jornada/:etapa" element={<JourneyStepDetail />} />

              <Route path="novidades" element={<Novidades />} />
              <Route path="novidades/:slug" element={<NewsDetail />} />

              <Route path="time" element={<Time />} />
              <Route path="pessoas/:id" element={<PersonDetail />} />

              <Route path="vagas" element={<Vagas />} />
              <Route path="vagas/:id" element={<JobDetail />} />

              <Route path="busca" element={<Busca />} />
              <Route path="quiz" element={<Quiz />} />
              <Route path="perfil" element={<Perfil />} />

              {/* Administração */}
              <Route path="admin" element={<RequireAdmin><AdminHome /></RequireAdmin>} />
              <Route path="admin/edicoes" element={<RequireAdmin><AdminEditions /></RequireAdmin>} />
              <Route path="admin/edicao/:id" element={<RequireAdmin><AdminEditionEdit /></RequireAdmin>} />
              <Route path="admin/colecao/:key" element={<RequireAdmin><AdminCollection /></RequireAdmin>} />
              <Route path="admin/colecao/:key/:id" element={<RequireAdmin><AdminRecordEdit /></RequireAdmin>} />
              <Route path="admin/acessos" element={<RequireAdmin><AdminAccess /></RequireAdmin>} />
              <Route path="admin/quiz" element={<RequireAdmin><AdminQuizzes /></RequireAdmin>} />
              <Route path="admin/quiz/:id" element={<RequireAdmin><AdminQuizEdit /></RequireAdmin>} />
              <Route path="admin/quiz/:id/resultados" element={<RequireAdmin><AdminQuizResults /></RequireAdmin>} />
              <Route path="admin/abas" element={<RequireAdmin><AdminNav /></RequireAdmin>} />
              <Route path="admin/config" element={<RequireAdmin><AdminSettings /></RequireAdmin>} />
              <Route path="admin/senha" element={<RequireAdmin><AdminPassword /></RequireAdmin>} />

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
