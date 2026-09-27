import Image from "next/image";

export default function StoryHero() {
  return (
    <section className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
      {/* Text Details */}
      <div className="flex flex-col gap-6 lg:max-w-xl">
        <h1 className="text-4xl font-semibold tracking-wide text-black sm:text-5xl">
          Our Story
        </h1>
        <p className="text-base leading-relaxed text-black">
          Launced in 2015, Exclusive is South Asia&apos;s premier online shopping
          marketplace with an active presence in Bangladesh. Supported by wide range
          of tailored marketing, data and service solutions, Exclusive has 10,500
          sellers and 300 brands and serves 3 million customers across the region.
        </p>
        <p className="text-base leading-relaxed text-black">
          Exclusive has more than 1 Million products to offer, growing at a very
          fast. Exclusive offers a diverse assotment in categories ranging from
          consumer.
        </p>
      </div>

      {/* Hero Image Container */}
      <div className="relative h-[300px] w-full overflow-hidden rounded-md sm:h-[500px] lg:h-[600px]">
        <Image
          src="/women.png"
          alt="Two women with shopping bags"
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
      </div>
    </section>
  );
}