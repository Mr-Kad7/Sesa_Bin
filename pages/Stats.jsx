import CountUp from "react-countup";

export default function Stats({ darkMode }) {
  const stats = [
    {
      value: 15000,
      suffix: "+",
      label: "Pickups Completed",
    },
    {
      value: 120,
      suffix: "T",
      label: "Waste Recycled",
    },
    {
      value: 8000,
      suffix: "+",
      label: "Active Users",
    },
    {
      value: 50,
      suffix: "+",
      label: "Communities",
    },
  ];

  return (
    <section className={`py-20 transition-colors duration-500 ${
      darkMode ? "bg-slate-950 text-white" : "bg-white text-gray-900"
    }`}>

      <div className="max-w-7xl mx-auto px-6">

        <div className="grid md:grid-cols-4 gap-8">

          {stats.map((stat, index) => (
            <div
              key={index}
              className={`rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl transition ${
                darkMode ? "bg-slate-800" : "bg-white"
              }`}
            >

              <h2 className="text-5xl font-bold text-green-600 mb-2">

                <CountUp
                  end={stat.value}
                  duration={3}
                  separator=","
                />

                {stat.suffix}

              </h2>

              <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                {stat.label}
              </p>

            </div>
          ))}

        </div>

      </div>

    </section>
  );
}
