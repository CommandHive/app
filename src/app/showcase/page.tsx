import Image from "next/image";
import Link from "next/link";

const showcaseItems = [
  {
    id: 1,
    title: "Image Optimization Tool",
    description: "Compress and resize images automatically to optimize web performance without losing quality.",
    calls: "1,256 Calls",
    image: "/showcase1.svg", // You'll need to add actual images
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
    title: "PDF Report Generator",
    description: "Convert structured data into well-formatted PDF reports instantly.",
    calls: "1,256 Calls",
    image: "/showcase4.svg",
    category: "Simplify your security with our services"
  },
  {
    id: 5,
    title: "SEO Keyword Analyzer",
    description: "Analyze your website's keywords and get optimization suggestions to boost search rankings.",
    calls: "1,256 Calls",
    image: "/showcase5.svg",
    category: "We are always ready to help you and answer your questions"
  },
  {
    id: 6,
    title: "Social Media Scheduler",
    description: "Plan, schedule, and publish posts across multiple platforms with one click.",
    calls: "1,256 Calls",
    image: "/showcase6.svg",
    category: "The only way to get your content out"
  }
];

const ShowcasePage = () => {
  return (
    <main className="flex justify-center">
      <div className="max-w-[1216px] flex flex-col items-center justify-center gap-16">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center gap-[50px] pt-[122px]">
            <div className="text-center">
            <h1 className="text-[40px] font-semibold text-[#14110E] mb-4">
                Built With CommandHive<span className="bg-yellow-400 rounded-sm w-2 h-2 inline-block"></span>
            </h1>
            <p className="text-[16px] text-[#667085] max-w-2xl mx-auto">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt 
                ut labore et dolore magna aliqua. Ut enim ad minim
            </p>
            </div>
        {/* Featured Section */}
        <div className="flex rounded-xl overflow-clip bg-white w-full">
          {/* Left Side - Featured Card */}
          <div className="bg-white p-[50px] w-[528px] flex flex-col gap-8">
            <div className="text-[18px] text-gray-600 font-medium">Featured This Week</div>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <h2 className="text-[32px] font-semibold text-gray-900">Web Scraping Server</h2>
                    <div className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 w-fit rounded-3xl pl-[6px] pr-3 py-2">
                        <Image
                            src={"/callstool.svg"}
                            alt="totalcalls"
                            width={18}
                            height={18}
                        />
                        1,256 Calls
                    </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do 
                    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut 
                    enim ad minim veniam, quis nostrud exercitation
                </p>
            </div>
            <button className="text-[#F79009] flex items-center gap-1 font-medium text-[18px] hover:text-[#F79009]">
              Explore
              <Image
                src={"/arrow.svg"}
                alt="arrow-right"
                width={18}
                height={18}
                className="w-6 h-6"
              />
            </button>
          </div>
          {/* Right Side - Featured Image */}
          <div className="bg-gray-900 w-[688px] rounded-xl overflow-clip">
             <Image
                src={"/showcase.svg"}
                alt="showcase"
                width={688}
                height={400}
                className="w-full h-full object-cover"
             />
          </div>
        </div>
        </div>
        <div className=" flex flex-col gap-[30px]">
            {/* Discover More Button */}
            <div className="text-center">
            <button className="text-gray-600 font-medium text-[22px] hover:text-gray-800 flex items-center mx-auto gap-2">
                <Image
                    src={"/sparkle.svg"}
                    alt="sparkles"
                    width={24}
                    height={24}
                />
                 Discover More
            </button>
            </div>
            {/* Showcase Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[25px]">
            {showcaseItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    <Link href={`/showcase/${item.id}`}>
                    <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-b-lg">
                        <Image
                            src={item.image}
                            alt={item.title}
                            width={300}
                            height={200}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="py-6 px-4 flex flex-col gap-2">
                        <div className="flex justify-between items-center gap-2">
                            <h3 className="font-semibold text-black text-[16px]">{item.title}</h3>
                            <div className="flex items-center gap-1 text-[11px] text-gray-500 bg-gray-100 w-fit rounded-3xl pl-[6px] pr-3 py-1">
                                <Image
                                    src={"/callstool.svg"}
                                    alt="totalcalls"
                                    width={14}
                                    height={14}
                                />
                                {item.calls}
                            </div>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{item.description}</p>
                    </div>
                    </Link>
                </div>
            ))}
            </div>

            {/* Load More Button */}
            <div className="text-center mb-16">
            <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-md">
                Load More
            </button>
            </div>
        </div>
      </div>
    </main>
  );
};

export default ShowcasePage;