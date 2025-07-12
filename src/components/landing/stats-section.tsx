export function StatsSection() {
  return (
    <section className="pt-16 px-4">
      <div className="bg-primary py-16 rounded-lg">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-5xl font-bold mb-2 text-accent">10,000+</div>
            <p className="text-accent text-lg">Dokumen Diproses</p>
          </div>
          <div>
            <div className="text-5xl font-bold mb-2 text-accent">5,000+</div>
            <p className="text-accent text-lg">Pengguna Puas</p>
          </div>
          <div>
            <div className="text-5xl font-bold mb-2 text-accent">99.9%</div>
            <p className="text-accent text-lg">Tingkat Keberhasilan</p>
          </div>
        </div>
      </div>
    </section>
  );
}
