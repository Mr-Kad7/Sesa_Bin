export default function HowItWorks({ darkMode }) {
  const steps = [
    {
      number: "01",
      title: "Schedule Pickup",
      desc: "Choose the waste type and pickup location."
    },
    {
      number: "02",
      title: "Collection",
      desc: "Our team collects and sorts recyclable materials."
    },
    {
      number: "03",
      title: "Earn Rewards",
      desc: "Receive points and rewards for recycling."
    }
  ];

  return (
    <section
      id="how-it-works"
      className={`py-24 transition-colors duration-500 ${
        darkMode ? "bg-slate-950 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold">
            How It Works
          </h2>

          <p className={`mt-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            Recycling has never been easier.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">

          {steps.map((step, index) => (
            <div
              key={index}
              className={`p-8 rounded-2xl shadow-md hover:shadow-xl transition ${
                darkMode ? "bg-slate-800" : "bg-white"
              }`}
            >
              <div className="text-5xl font-bold text-green-600 mb-4">
                {step.number}
              </div>

              <h3 className="text-2xl font-semibold mb-3">
                {step.title}
              </h3>

              <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                {step.desc}
              </p>
            </div>
          ))}

        </div>

      </div>

    </section>
  );
}
