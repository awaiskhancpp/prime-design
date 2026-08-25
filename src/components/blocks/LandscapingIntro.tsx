export function LandscapingIntro() {
  return (
    <section className="relative w-full bg-[#1b2238] overflow-hidden">
      {/* Background Image Container */}
      {/* Positioned to the right to avoid rendering under the solid color */}
      <div
        className="absolute inset-y-0 right-0 w-full md:w-3/4 bg-cover bg-center bg-no-repeat"
        style={{
          // Replace with your actual media asset path
          backgroundImage: "url('/before-after/kitchen-remodel-bg.jpg')",
        }}
      />

      {/* Gradient Overlay */}
      {/* Creates the solid blue on the left (up to 50%) and fades into the image on the right */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1b2238] from-50% via-[#1b2238]/80 to-transparent" />

      {/* Content Container */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 md:py-16 lg:px-8">
        <div className="max-w-xl lg:max-w-2xl text-white">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem] lg:leading-[3rem] mb-6">
            Discover the Prime experience with a new home renovation, ADU, home addition or kitchen
            and bathroom remodel
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-gray-100">
            Where we transform blueprints into reality with unwavering dedication and unmatched
            expertise. Your vision is our foundation, and together, we construct a future of
            enduring quality and innovation. Let&apos;s build something extraordinary.
          </p>
        </div>
      </div>
    </section>
  )
}
