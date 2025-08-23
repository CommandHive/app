"use client";

import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiService, ChatSession, ChatSessionsResponse } from "@/lib/api";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Trash2 } from "lucide-react";

const MyServersPage = () => {
  const { accessToken, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated && accessToken) {
      fetchSessions();
    }
  }, [accessToken, isAuthenticated, authLoading]);

  const fetchSessions = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      setError(null);
      console.log("Fetching chat sessions...");

      const response: ChatSessionsResponse | null =
        await apiService.getChatSessions(accessToken);

      if (response && response.success) {
        console.log("Sessions fetched successfully:", response.sessions);
        setSessions(response.sessions);
      } else {
        setError("Failed to fetch sessions");
        console.error("Failed to fetch sessions:", response);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setError("Error fetching sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleSessionClick = (sessionId: string) => {
    router.push(`/chat/${sessionId}`);
  };

  const generateChartData = (sessionId: string) => {
    // Create 7 data points for the last week
    const data = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Generate some sample data based on session ID for variety
      const seed = sessionId.charCodeAt(0) || 1;
      const baseCalls = Math.floor(Math.random() * seed * 10);
      const baseInvocations = Math.floor(Math.random() * seed * 15);

      data.push({
        day:
          i === 0
            ? "Today"
            : i === 1
            ? "Yesterday"
            : date.toLocaleDateString("en-US", { weekday: "short" }),
        totalCalls: Math.max(
          0,
          baseCalls + Math.floor(Math.random() * 20) - 10
        ),
        invocations: Math.max(
          0,
          baseInvocations + Math.floor(Math.random() * 25) - 12
        ),
      });
    }

    return data;
  };

  // Mini chart component
  const MiniChart = ({ data }: { data: any[] }) => (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <XAxis dataKey="day" hide />
        <YAxis hide />
        <Line
          type="monotone"
          dataKey="totalCalls"
          stroke="#f97316"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3, fill: "#f97316" }}
        />
        <Line
          type="monotone"
          dataKey="invocations"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3, fill: "#3b82f6" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <ProtectedRoute>
      <section className="pt-[122px] flex flex-col gap-10 items-center">
        <div className="flex items-center justify-between w-[1216px]">
          <div className="text-[32px] text-[#14110E] font-semibold">
            My Servers
          </div>
          <div className="rounded-[80px] bg-white flex items-center gap-2 px-4 py-2 border border-gray-200">
            <Image
              src={"/filter-lines.svg"}
              alt="sort-icon"
              width={20}
              height={20}
            />
            <span className="text-[14px] text-[#1D2939] font-medium">
              Sort Servers
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="w-[1216px] flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading your servers...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="w-[1216px] bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={fetchSessions}
                    className="bg-red-100 hover:bg-red-200 text-red-800 font-medium py-2 px-4 rounded transition duration-200"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sessions List */}
        {!loading && !error && (
          <>
            {sessions.length === 0 ? (
              <div className="w-[1216px] text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No servers yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first MCP server to get started
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Create Your First Server
                </button>
              </div>
            ) : (
              <div className="w-[1216px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.map((session) => {
                  const chartData = generateChartData(session.id);
                  const totalCalls =
                    chartData[chartData.length - 1]?.totalCalls || 0;
                  const totalInvocations =
                    chartData[chartData.length - 1]?.invocations || 0;

                  return (
                    <div
                      key={session.id}
                      onClick={() => handleSessionClick(session.id)}
                      className="bg-white rounded-lg p-4 border border-gray-200 flex flex-col gap-4 hover:border-orange-200 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[22px] font-semibold text-black">
                            {session.title ||
                              `Server ${session.id.substring(0, 8)}`}
                          </h3>
                          <div className="rounded-sm border text-gray-600 border-gray-200 bg-gray-50 p-1.5">
                            <Trash2 className="w-4 h-4" />
                          </div>
                        </div>
                        <p className="mt-1 text-[14px] leading-5 text-gray-700">
                          Created:{" "}
                          {new Date(session.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col gap-2 w-1/2">
                          <div className="rounded-md bg-gray-50 p-2 flex items-center gap-2">
                            <Image
                              src={"/totalcalls.svg"}
                              alt="totalcalls"
                              width={24}
                              height={24}
                            />
                            <div className="text-[18px] font-semibold text-gray-800">
                              {totalCalls}
                            </div>
                            <div className="text-[12px] text-gray-500 leading-none">
                              Total calls
                            </div>
                          </div>
                          <div className="rounded-md bg-gray-50 p-2 flex items-center gap-2">
                            <Image
                              src={"/invocation.svg"}
                              alt="invocations"
                              width={24}
                              height={24}
                            />
                            <div className="text-[18px] font-semibold text-gray-800">
                              {totalInvocations}
                            </div>
                            <div className="text-[12px] text-gray-500 leading-none">
                              Invocations
                            </div>
                          </div>
                        </div>
                        <div className="h-[80px] w-1/2">
                          <MiniChart data={chartData} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>
    </ProtectedRoute>
  );
};

export default MyServersPage;
