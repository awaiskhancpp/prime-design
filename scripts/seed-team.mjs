// Seeds the Team collection with the 12 WordPress team members (names,
// positions and bios harvested from the live WordPress team page; photos
// imported into media from the local WordPress files).
import pg from '../node_modules/.pnpm/pg@8.20.0/node_modules/pg/esm/index.mjs'
import { readFileSync } from 'node:fs'

const env = readFileSync('.env', 'utf8')
const url = (env.match(/^DATABASE_URL=(.*)$/m)?.[1] || '').trim().replace(/^"(.*)"$/, '$1')
const client = new pg.Client({ connectionString: url })
await client.connect()

const paragraph = (text) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [
      {
        type: 'paragraph',
        version: 1,
        children: [{ type: 'text', text, format: 0, detail: 0, style: '', mode: 'normal', version: 1 }],
      },
    ],
  },
})

const members = [
  ['Noah', 'noah', 'CEO', 455, 'With an unwavering vision and a strategic mindset, Noah leads Prime Design and Build toward innovation and success. As the CEO, he brings together a perfect blend of creativity and business acumen to drive the company\u2019s growth. With a genuine dedication to crafting extraordinary living spaces, Noah ensures that every project reflects the values and aspirations of our clients.'],
  ['Jane Zamora', 'jane-zamora', 'Executive Assistant to the CEO', 456, 'Jane supports executive operations at Prime Design and Build with a strong focus on organization, coordination, and follow through. She manages schedules, communication, and internal workflows to keep leadership aligned and operations running efficiently. Her attention to detail and reliability help ensure smooth day to day execution across the company.'],
  ['Ariela', 'ariela', 'HR Manager', 457, 'Ariela oversees human resources at Prime Design and Build, supporting team growth, culture, and compliance. She manages hiring, onboarding, and internal policies while fostering a positive and organized work environment. Her people first mindset helps build strong teams and long term stability.'],
  ['Joseph Avri', 'joseph-avri', 'Sales Manager', 458, ''],
  ['Isabella', 'isabella', 'Project Coordinator', 459, 'With a passion for people and a talent for coordination, Isabella brings clarity, energy, and warmth to every project she touches. As Project Coordinator at Prime Design & Build, she ensures each client feels supported from day one\u2014managing timelines, communication, and logistics with confidence and care. Known for her upbeat approach and strong relationships, Isabella plays a key role in turning big ideas into beautifully built realities, all while making the journey as smooth and enjoyable as possible.'],
  ['Mahsa', 'mahsa', 'Architectural Designer', 460, 'With a keen eye for detail and a passion for functional beauty, Mahsa shapes spaces that balance innovation with timeless design. As an Architectural Designer at Prime Design and Build, she brings creativity, precision and technical expertise to every project. Guided by a deep commitment to enhancing how people live and interact with their environments, Mahsa transforms concepts into thoughtful architectural solutions that inspire and endure.'],
  ['Juan', 'juan', 'Superintendent', 461, 'Juan brings strong leadership and organizational skills to his role as Superintendent at Prime Design and Build. With extensive field experience, he manages day-to-day site operations, coordinates subcontractors and ensures that every phase of construction runs efficiently and to the highest standard. Committed to safety, quality and teamwork, Juan plays a key role in turning project plans into reality while keeping clients\u2019 visions at the center of the process.'],
  ['Jelena', 'jelena', 'Executive Assistant to the DOO', 462, 'Jelena supports daily operations by assisting the Director of Operations with scheduling, coordination, and internal communication. She helps keep projects, teams, and timelines organized while ensuring operational workflows run smoothly. Her structure and responsiveness support efficiency across departments.'],
  ['Hadar Adams', 'hadar-adams', 'Senior Sales Specialist', 463, 'Hadar leads client engagement with experience and insight as a Senior Sales Specialist. She works closely with homeowners to understand goals, outline scopes, and set realistic expectations. Her consultative approach helps create strong relationships and successful project starts.'],
  ['Gabrielle Alomia', 'gabrielle-alomia', 'Interior Designer', 464, 'Gabrielle brings creativity and structure to interior design at Prime Design and Build. She focuses on layout, material selection, and finish coordination to create spaces that feel intentional and elevated. Her collaborative process ensures each design aligns with both the client vision and the build plan.'],
  ['Charlotte Cheng', 'charlotte-cheng', 'Senior Kitchen & Bath Designer', 465, 'Charlotte leads kitchen and bathroom design projects at Prime Design and Build, creating functional and elegant spaces tailored to each client\u2019s lifestyle. She specializes in space planning, material selection, and design development, ensuring every project is both beautiful and practical from concept to completion.'],
  ['Jefelene Aton', 'jefelene-aton', 'AP/AR Bookkeeper', 466, 'Jef oversees Accounts Payable and Accounts Receivable for Prime Design and Build, ensuring all project-related financial transactions are accurately recorded and well organized. She manages vendor payments, client invoicing, and ongoing account reconciliations to maintain smooth and timely cash flow across active projects. With a strong focus on accuracy and consistency, Jef supports the finance and operations teams by keeping financial records up to date and ensuring all billing and payments align with company standards.'],
]

const base = Date.now()
for (let i = 0; i < members.length; i++) {
  const [name, slug, position, imageId, bio] = members[i]
  const createdAt = new Date(base + i * 1000).toISOString()
  await client.query(
    `INSERT INTO team (name, slug, position, image_id, bio, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $6)
     ON CONFLICT (slug) DO UPDATE SET
       name = EXCLUDED.name,
       position = EXCLUDED.position,
       image_id = EXCLUDED.image_id,
       bio = EXCLUDED.bio,
       updated_at = EXCLUDED.updated_at`,
    [name, slug, position, imageId, bio ? JSON.stringify(paragraph(bio)) : null, createdAt],
  )
  console.log(`seeded ${name}`)
}

await client.end()
console.log('done')
