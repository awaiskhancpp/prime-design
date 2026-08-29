import { BrandMark } from '../layout/BrandMark'
import { Container } from '../ui/Container'
export function ServiceLocationFooter() {
  return (
    <div className="bg-ink-2">
      <Container className="">
        <div className="mt-8 flex flex-col items-start justify-between gap-6 px-6 py-6 sm:flex-row sm:items-center sm:px-8">
          <div className="text-left sm:text-right">
            <p className="text-lg text-brass">
              COPYRIGHT © 2026 Prime Design & Build ALL RIGHTS RESERVED.
            </p>
          </div>
          <BrandMark />
        </div>
      </Container>
    </div>
  )
}
