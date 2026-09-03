// Gera SQL de seed a partir dos dados mock, para popular o Supabase.
import { news } from '../src/data/news'
import { pops } from '../src/data/pops'
import { dashboards, tools, jobs } from '../src/data/misc'
import { people } from '../src/data/people'
import { projects } from '../src/data/projects'

function s(v: unknown): string {
  if (v === null || v === undefined) return 'null'
  return `'${String(v).replace(/'/g, "''")}'`
}
function j(v: unknown): string {
  return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`
}
function n(v: unknown): string {
  return v === null || v === undefined ? 'null' : String(Number(v))
}
function b(v: unknown): string {
  return v ? 'true' : 'false'
}

const out: string[] = []

// news
news.forEach((a, i) => {
  out.push(
    `insert into public.news (slug,category,title,excerpt,content,image,author,author_role,reading_minutes,featured,views,status,publish_at,sort) values (${s(a.slug)},${s(a.category)},${s(a.title)},${s(a.excerpt)},${j(a.content)},${s(a.image)},${s(a.author)},${s(a.authorRole)},${n(a.readingMinutes)},${b(a.featured)},${n(a.views)},'published',${s(a.date + 'T08:00:00Z')},${i});`,
  )
})

// pops
pops.forEach((p, i) => {
  out.push(
    `insert into public.pops (code,name,category,version,owner,status,summary,steps,doc_updated,published,sort) values (${s(p.code)},${s(p.name)},${s(p.category)},${s(p.version)},${s(p.owner)},${s(p.status)},${s(p.summary)},${j(p.steps)},${s(p.updatedAt)},true,${i});`,
  )
})

// dashboards
dashboards.forEach((d, i) => {
  out.push(
    `insert into public.dashboards (name,category,description,owner,provider,href,doc_updated,published,sort) values (${s(d.name)},${s(d.category)},${s(d.description)},${s(d.owner)},${s(d.provider)},${s(d.href)},${s(d.updatedAt)},true,${i});`,
  )
})

// tools
tools.forEach((t, i) => {
  out.push(
    `insert into public.tools (name,category,description,owner,version,href,published,sort) values (${s(t.name)},${s(t.category)},${s(t.description)},${s(t.owner)},${s(t.version)},${s(t.href)},true,${i});`,
  )
})

// jobs
jobs.forEach((v, i) => {
  out.push(
    `insert into public.jobs (title,area,location,model,shift,region,summary,posted_at,published,sort) values (${s(v.title)},${s(v.area)},${s(v.location)},${s(v.model)},${s(v.shift)},${s(v.region)},${s(v.summary)},${s(v.postedAt)},true,${i});`,
  )
})

// people
people.forEach((p, i) => {
  out.push(
    `insert into public.people (name,role,region,shift,contact,photo,level,quote,published,sort) values (${s(p.name)},${s(p.role)},${s(p.region)},${s(p.shift)},${s(p.contact)},${s(p.photo)},${s(p.level)},${s(p.quote ?? null)},true,${i});`,
  )
})

// projects
projects.forEach((p, i) => {
  out.push(
    `insert into public.projects (name,progress,owner,status,deadline,last_update,published,sort) values (${s(p.name)},${n(p.progress)},${s(p.owner)},${s(p.status)},${s(p.deadline)},${s(p.lastUpdate)},true,${i});`,
  )
})

console.log(out.join('\n'))
