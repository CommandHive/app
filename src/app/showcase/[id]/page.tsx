import Image from "next/image";

const relatedItems = [
  {
    id: 1,
    title: "Image Optimization Tool",
    description: "Compress and resize images automatically to optimize web performance without losing quality.",
    calls: "1,256 Calls",
    image: "/showcase1.svg",
    category: "Articles for you"
  },
  {
    id: 2,
    title: "AI Chatbot Builder",
    description: "Build and customize AI-powered chatbots to handle customer queries in real time.",
    calls: "1,256 Calls",
    image: "/showcase2.svg",
    category: "The Future of Artificial Intelligence in Cybersecurity"
  },
  {
    id: 3,
    title: "Data Visualization Dashboard",
    description: "Transform raw data into interactive charts and graphs for better decision making.",
    calls: "1,256 Calls",
    image: "/showcase3.svg",
    category: "Thursday, Feb 17"
  },
  {
    id: 4,
    title: "Social Media Scheduler",
    description: "Plan, schedule, and publish posts across multiple platforms with one click.",
    calls: "1,256 Calls",
    image: "/showcase6.svg",
    category: "The only way to get your content out"
  }
];

const ShowcaseDetailPage = () => {
  return (
    <div className="min-h-screen pt-[72px] flex flex-col gap-20 items-center">
      {/* Main Content */}
      <div className="px-5 pt-20 flex flex-col gap-20">
        <div className="flex flex-col gap-[50px]">
            <div className="flex flex-col gap-6 px-[92px]">
                <div className="text-[18px] text-gray-600">
                    24 JAN 2025
                </div>
                <div className="flex items-center justify-between gap-3">
                    <h1 className="text-[48px] font-semibold text-black">
                        Automated Data Extraction Server
                    </h1>
                    <div className="flex items-center gap-1 text-[16px] text-gray-500 bg-white rounded-full px-3 py-2">
                        <Image
                        src="/callstool.svg"
                        alt="calls"
                        width={24}
                        height={24}
                        />
                        1256 Calls
                    </div>
                </div>
            </div>
            <div className="w-full">
                <Image
                src="/showcaseitem.png"
                alt="showcase"
                width={1216}
                height={500}
                className="w-full rounded-2xl"
                />
            </div>
            <div className="flex flex-col items-center gap-6 px-[275px]">
                <div className="flex flex-col max-w-[802px] gap-[50px]">
                    <div className="flex flex-col gap-4">
                        <h2 className="text-[24px] text-black font-semibold">
                            Automated Data Extraction and Transformation Server for Large-Scale Web Content Aggregation
                        </h2>
                        <p className="text-gray-700 leading-relaxed text-[16px]">
                            This MCP server is designed for developers, researchers, and businesses that need to collect and process vast amounts of online data without manual intervention. By combining advanced scraping techniques, intelligent parsing algorithms, and flexible output formats, it allows you to build reliable data pipelines for any industry — from e-commerce analytics to trend monitoring and academic research.
                        </p>
                        <p className="text-gray-700 leading-relaxed text-[16px]">
                            The server is highly configurable, letting you define target sources, extraction rules, scheduling intervals, and data transformations all from a central interface. Once set up, it runs autonomously, ensuring you have fresh, structured data whenever you need it. With built-in safeguards against IP blocking and adaptive rate control, the tool ensures long-term stability for your scraping projects.
                        </p>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h2 className="text-[24px] text-black font-semibold">How It Works</h2>
                        <p className="text-[16px] text-gray-700">The server connects to specified URLs, processes HTML or API responses, extracts the required data points using predefined selectors or AI-assisted parsing, and delivers them in your preferred format. With modular architecture, you can add your own processing logic, schedule scrapes, and integrate with third-party tools effortlessly.</p>
                    </div>

                    <div className="">
                        <button className="bg-[#FDB022] flex items-center gap-2 text-gray-900 hover:bg-[#FDB022]/80 px-5 py-3 rounded-md font-medium shadow-xs">
                            Explore Now
                            <Image
                                src="/arrow-up-right.svg"
                                alt="arrow"
                                width={20}
                                height={20}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
        {/* Discover More Section */}
        <div className="mb-8 w-full px-[92px] flex flex-col gap-[30px]">
          <div className="flex items-center gap-2">
            <Image
              src="/sparkle.svg"
              alt="sparkles"
              width={24}
              height={24}
            />
            <h2 className="text-[22px] font-medium text-gray-800">Discover More</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-32 bg-gradient-to-br from-blue-500 to-purple-600">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={300}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-medium text-sm text-gray-900">{item.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-1 whitespace-nowrap">
                      <Image
                        src="/callstool.svg"
                        alt="calls"
                        width={12}
                        height={12}
                      />
                      {item.calls}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowcaseDetailPage;