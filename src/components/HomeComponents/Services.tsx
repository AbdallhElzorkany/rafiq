import type { Feature } from "../../types/HomeCards";
import Service from "./Service";
export default function Services() {
  const services: Feature[] = [
    {
      img: "arrow.png",
      title: "Personalized Assessments",
      bg: "bg-red-100",
      description:
        "Comprehensive evaluations across speech, motor, and cognitive domains",
    },
    {
      img: "controller.png",
      title: "Interactive Games",
      bg: "bg-purple-100",
      description:
        "Engaging therapy activities designed for ages 6 months to 18 years",
    },
    {
      img: "chart.png",
      title: "Progress Dashboard",
      bg: "bg-orange-100",
      description:
        "Real-time tracking of milestones and developmental achievements",
    },
    {
      img: "video.png",
      title: "Video Consultations",
      bg: "bg-gray-100",
      description: "Secure, encrypted connections with certified specialists",
    },
    {
      img: "family.png",
      title: "Multi-User Access",
      bg: "bg-blue-100",
      description:
        "Separate portals for families, therapists, and healthcare providers",
    },
    {
      img: "Vector.png",
      title: "User-Friendly Design",
      bg: "bg-green-100",
      description:
        "Intuitive interface with accessibility features for all users",
    },
  ];
  return (
    <section
      id="services"
      className="mx-auto bg-linear-to-b from-gray-50 to-white md:pt-100 pt-50 pb-15 min-h-screen"
    >
      <section className="not-md:w-10/12 mx-auto">
        <div className="space-y-5 text-center">
          <h2 className="text-6xl not-lg:text-4xl font-semibold">
            Everything You Need in One Place
          </h2>
          <p className="text-xl not-lg:text-lg text-gray-600">
            Comprehensive tools designed for effective therapy and development
            tracking
          </p>
        </div>
        <section className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-x-30 p-20 not-md:px-0 ">
          {services.map((service, index) => (
            <Service
              key={index}
              img={service.img}
              title={service.title}
              description={service.description}
              bg={service.bg}
            />
          ))}
        </section>
      </section>
    </section>
  );
}
