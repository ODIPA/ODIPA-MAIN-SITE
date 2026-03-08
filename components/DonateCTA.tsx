import Image from 'next/image'

export default function DonateCTA() {
  return (
    <section
      id="donate"
      className="py-20 px-6 text-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0B1F3A 0%, #0D2B4E 50%, #152E52 100%)',
      }}
    >
      {/* Logo watermark */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
        aria-hidden
        style={{ opacity: 0.04 }}
      >
        <Image
          src="/logo-dark.png"
          alt=""
          width={700}
          height={233}
          className="w-[700px] h-auto object-contain"
        />
      </div>

      <div className="relative">
        <h2
          className="font-display font-black text-white leading-[1.1] mb-5"
          style={{ fontSize: 'clamp(32px, 5vw, 56px)' }}
        >
          Privacy Protection<br />Starts Here.
        </h2>
        <p className="text-[17px] text-white/60 leading-[1.7] max-w-[520px] mx-auto mb-10">
          Your support funds free education, independent research, open-source tools,
          and policy advocacy that protects millions of people&apos;s digital privacy rights.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <a
            href="/donate"
            className="inline-block bg-gold text-navy px-8 py-3.5 rounded font-bold text-[14px] tracking-[0.5px] hover:bg-gold-light hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(200,146,10,0.3)] transition-all no-underline"
          >
            Donate Now
          </a>
          <a
            href="/contact"
            className="inline-block border border-white/25 text-white/80 px-8 py-3.5 rounded font-medium text-[14px] hover:border-white/60 hover:text-white hover:bg-white/5 transition-all no-underline"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  )
}
