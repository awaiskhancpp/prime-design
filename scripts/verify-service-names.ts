import 'dotenv/config'
import { resolveConsultations } from '../src/lib/consultations'
import { resolveServices } from '../src/lib/services'

const cons = await resolveConsultations()
console.log('consultations (count ' + cons.length + '):')
for (const c of cons) console.log(`  ${c.title}  [${c.slug}]  img=${c.image}`)

const all = await resolveServices()
console.log('services:')
for (const s of all) console.log(`  ${s.title}  [${s.slug}]  consult=${s.showInConsultationForm}`)
process.exit(0)
