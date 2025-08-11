'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ShowcaseItem {
  id: number
  title: string
  description: string
  image: string
  videoUrl: string
  fullDescription: string
}

const showcaseData: ShowcaseItem[] = [
  {
    id: 1,
    title: "AI-Powered Code Assistant",
    description: "Revolutionary coding companion that understands context and generates intelligent suggestions.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    fullDescription: "Our AI-powered code assistant leverages advanced machine learning algorithms to understand your coding patterns and provide intelligent, context-aware suggestions. It can help you write cleaner code, fix bugs faster, and learn new programming concepts on the go. The assistant supports multiple programming languages and integrates seamlessly with your favorite IDE."
  },
  {
    id: 2,
    title: "Cloud Infrastructure Manager",
    description: "Streamline your cloud operations with automated deployment and monitoring tools.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    fullDescription: "Manage your entire cloud infrastructure from a single dashboard. Our platform provides automated deployment pipelines, real-time monitoring, cost optimization recommendations, and security compliance checks. Scale your applications effortlessly with intelligent auto-scaling and load balancing features."
  },
  {
    id: 3,
    title: "Data Analytics Platform",
    description: "Transform raw data into actionable insights with powerful visualization tools.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    fullDescription: "Our comprehensive data analytics platform helps you turn complex datasets into clear, actionable insights. With advanced visualization tools, machine learning capabilities, and real-time processing, you can discover patterns, predict trends, and make data-driven decisions with confidence."
  },
  {
    id: 4,
    title: "Mobile App Development Kit",
    description: "Build native mobile apps faster with our comprehensive development toolkit.",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    fullDescription: "Accelerate your mobile app development with our all-in-one toolkit. Features include cross-platform compatibility, pre-built UI components, automated testing frameworks, and seamless deployment to app stores. Build beautiful, performant apps for iOS and Android from a single codebase."
  },
  {
    id: 5,
    title: "Cybersecurity Shield",
    description: "Protect your digital assets with enterprise-grade security solutions.",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=300&fit=crop",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    fullDescription: "Comprehensive cybersecurity solution that protects your organization from evolving threats. Features include advanced threat detection, real-time monitoring, automated incident response, and compliance management. Our AI-powered security engine learns from your environment to provide personalized protection."
  },
  {
    id: 6,
    title: "E-commerce Platform",
    description: "Launch your online store with our feature-rich e-commerce solution.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    fullDescription: "Build and manage your online store with ease. Our e-commerce platform includes inventory management, payment processing, order tracking, customer analytics, and marketing tools. Scale your business with built-in SEO optimization and mobile-responsive design."
  },
  {
    id: 7,
    title: "Project Management Suite",
    description: "Collaborate effectively and deliver projects on time with our management tools.",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    fullDescription: "Streamline your project workflows with our comprehensive management suite. Track progress, manage resources, collaborate with team members, and deliver projects on time and within budget. Features include Gantt charts, time tracking, resource allocation, and detailed reporting."
  },
  {
    id: 8,
    title: "IoT Device Controller",
    description: "Monitor and control your IoT devices from a centralized dashboard.",
    image: "https://images.unsplash.com/photo-1518350607470-b6a325ce5ea0?w=400&h=300&fit=crop",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    fullDescription: "Manage your entire IoT ecosystem from one powerful dashboard. Monitor device performance, receive alerts, schedule automated actions, and analyze usage patterns. Our platform supports thousands of device types and provides secure, reliable connectivity."
  },
  {
    id: 9,
    title: "Learning Management System",
    description: "Create engaging educational experiences with our comprehensive LMS.",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    fullDescription: "Design and deliver exceptional learning experiences with our feature-rich LMS. Create interactive courses, track student progress, facilitate discussions, and generate detailed analytics. Perfect for educational institutions, corporate training, and online course creators."
  }
]

export default function ShowcasePage() {
  const [selectedItem, setSelectedItem] = useState<ShowcaseItem | null>(null)

  const openModal = (item: ShowcaseItem) => {
    setSelectedItem(item)
  }

  const closeModal = () => {
    setSelectedItem(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Showcase</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our innovative solutions and see how we're transforming the digital landscape
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {showcaseData.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => openModal(item)}
            >
              <div className="relative h-48">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedItem.title}</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-6">
                <video
                  controls
                  className="w-full h-64 rounded-lg"
                  poster={selectedItem.image}
                >
                  <source src={selectedItem.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              
              <div className="text-gray-700 leading-relaxed">
                <p>{selectedItem.fullDescription}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}