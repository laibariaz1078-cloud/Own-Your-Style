import { Truck, Headset, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "FREE AND FAST DELIVERY",
    description: "Free delivery for all orders over $140",
  },
  {
    icon: Headset,
    title: "24/7 CUSTOMER SERVICE",
    description: "Friendly 24/7 customer support",
  },
  {
    icon: ShieldCheck,
    title: "MONEY BACK GUARANTEE",
    description: "We reurn money within 30 days",
  },
];

export default function FeaturesStrip() {
  return (
    <div className="grid grid-cols-1 py-10 sm:grid-cols-3">
      {features.map((feature) => {
        const Icon = feature.icon;
        return (
          <div
            key={feature.title}
            className="flex flex-col items-center text-center"
          >
            {/* Concentric Double Circle Icon Container */}
            <div className="mb-6 flex h-[65px] w-[65px] items-center justify-center rounded-full bg-[#C1C5CC]/60">
              <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-black text-white">
                <Icon className="h-10 w-10 stroke-[2]" />
              </div>
            </div>

            {/* Title & Description */}
            <h4 className="mb-2 text-lg font-bold tracking-wide text-black">
              {feature.title}
            </h4>
            <p className="text-sm font-normal text-black">
              {feature.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}