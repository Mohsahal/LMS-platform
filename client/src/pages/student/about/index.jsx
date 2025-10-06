import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  Users, 
  Target, 
  Mail, 
  Twitter, 
  Linkedin, 
  Github,
  CheckCircle,
  Globe,
  Lightbulb,
  Code,
  Database,
  Clock,
  Star,
  GraduationCap,
  Heart,
  Rocket,
  Briefcase,
  Sparkles
} from "lucide-react";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  useScrollAnimation, 
  useStaggerAnimation, 
  useCounterAnimation,
  useTextReveal,
  usePageTransition
} from "@/hooks/use-gsap";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

function AboutPage() {
  // Animation refs
  const heroRef = useScrollAnimation('fadeInUp');
  const statsRef = useStaggerAnimation('staggerFadeInScale');
  const missionRef = useScrollAnimation('fadeInLeft');
  const visionRef = useScrollAnimation('fadeInRight');
  
  // Counter animations
  const studentsCounterRef = useCounterAnimation(50000, { suffix: '+' });
  const ratingCounterRef = useCounterAnimation(4.9, { suffix: '/5' });
  const placementCounterRef = useCounterAnimation(95, { suffix: '%' });
  const countriesCounterRef = useCounterAnimation(150, { suffix: '+' });
  
  // Text reveal animations
  const titleRef = useTextReveal();
  const subtitleRef = useTextReveal({ delay: 0.2 });
  
  // Page transition
  const { ref: pageRef, enter } = usePageTransition();

  useEffect(() => {
    // Page enter animation
    enter('fade');
    
    // Hero section animations
    const heroTimeline = gsap.timeline({ delay: 0.5 });
    heroTimeline
      .fromTo('.hero-logo', 
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 1, ease: "back.out(1.7)" }
      )
      .fromTo('.hero-title', 
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
        "-=0.5"
      )
      .fromTo('.hero-subtitle', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
        "-=0.3"
      );

    // Floating background elements
    gsap.to('.floating-bg-1', {
      y: -20,
      duration: 3,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1
    });

    gsap.to('.floating-bg-2', {
      y: 20,
      duration: 4,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1
    });

    // Card hover animations
    const cards = document.querySelectorAll('.animated-card');
    cards.forEach(card => {
      const hoverIn = gsap.timeline({ paused: true });
      const hoverOut = gsap.timeline({ paused: true });
      
      hoverIn
        .to(card, { y: -15, scale: 1.02, duration: 0.3, ease: "power2.out" })
        .to(card.querySelector('.card-shadow'), { 
          boxShadow: "0 25px 50px rgba(0,0,0,0.15)", 
          duration: 0.3 
        }, 0);
      
      hoverOut
        .to(card, { y: 0, scale: 1, duration: 0.3, ease: "power2.out" })
        .to(card.querySelector('.card-shadow'), { 
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)", 
          duration: 0.3 
        }, 0);
      
      card.addEventListener('mouseenter', () => hoverIn.play());
      card.addEventListener('mouseleave', () => hoverOut.play());
    });

    // Button animations
    const buttons = document.querySelectorAll('.animated-button');
    buttons.forEach(button => {
      const clickAnimation = gsap.timeline({ paused: true });
      
      clickAnimation
        .to(button, { scale: 0.95, duration: 0.1 })
        .to(button, { scale: 1, duration: 0.1 });
      
      button.addEventListener('click', () => clickAnimation.play());
    });

    // Icon animations
    const icons = document.querySelectorAll('.animated-icon');
    icons.forEach(icon => {
      gsap.fromTo(icon, 
        { scale: 0, rotation: -180 },
        { 
          scale: 1, 
          rotation: 0, 
          duration: 0.6, 
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: icon,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // Text animations
    const textElements = document.querySelectorAll('.animated-text');
    textElements.forEach((text, index) => {
      gsap.fromTo(text, 
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.6, 
          ease: "power2.out",
          delay: index * 0.1,
          scrollTrigger: {
            trigger: text,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [enter]);
  return (
    <div ref={pageRef} className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section */}
      <section ref={heroRef} className="relative px-4 lg:px-8 py-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-cyan-600/5"></div>
        <div className="floating-bg-1 absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="floating-bg-2 absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="hero-logo w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-8 h-8 text-white animated-icon" />
            </div>
            <h1 ref={titleRef} className="hero-title text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              About BRAVYNEX
            </h1>
          </div>
          <p ref={subtitleRef} className="hero-subtitle text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed">
            Welcome to Bravynex Online Courses, where learning meets convenience!<br/>
            Explore engaging courses tailored to all skill levels and interests—from professional growth to creative hobbies. 
            Our expert-led programs deliver practical knowledge for immediate use. With flexible schedules, an easy-to-use platform, 
            and personalized support, Bravynex makes learning enjoyable and accessible. Unlock your potential and grow with us, 
            all from the comfort of your home!
          </p>
          
          {/* Company Affiliations
          <div className="mb-12">
            <p className="text-lg text-gray-600 mb-8">
              Our company, started in 2024, is affiliated with VTU, MSME, NSDC and registered under Startup India.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-80">
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <div className="w-24 h-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">VTU</span>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <div className="w-24 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">MSME</span>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <div className="w-24 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">NSDC</span>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <div className="w-24 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">Startup India</span>
                </div>
              </div>
            </div>
          </div> */}
          
          {/* Stats Cards */}
          <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Card className="animated-card bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white animated-icon" />
                </div>
                <div ref={studentsCounterRef} className="text-3xl font-bold text-gray-900 mb-2">0</div>
                <div className="text-gray-600 font-medium animated-text">Active Students</div>
              </CardContent>
            </Card>
            
            <Card className="animated-card bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-white animated-icon" />
                </div>
                <div ref={ratingCounterRef} className="text-3xl font-bold text-gray-900 mb-2">0</div>
                <div className="text-gray-600 font-medium animated-text">Average Rating</div>
              </CardContent>
            </Card>
            
            <Card className="animated-card bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-6 h-6 text-white animated-icon" />
                </div>
                <div ref={placementCounterRef} className="text-3xl font-bold text-gray-900 mb-2">0</div>
                <div className="text-gray-600 font-medium animated-text">Job Placement</div>
              </CardContent>
            </Card>
            
            <Card className="animated-card bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-6 h-6 text-white animated-icon" />
                </div>
                <div ref={countriesCounterRef} className="text-3xl font-bold text-gray-900 mb-2">0</div>
                <div className="text-gray-600 font-medium animated-text">Countries</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="px-4 lg:px-8 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 animated-text">Our Mission & Vision</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed animated-text">
              We&apos;re committed to democratizing technology education and empowering learners worldwide 
              with the skills they need to succeed in the digital age.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Mission */}
            <Card ref={missionRef} className="animated-card bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <Target className="w-8 h-8 text-white animated-icon" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-gray-900 animated-text">Our Mission</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg text-gray-700 leading-relaxed animated-text">
                  Registered under MICRO, SMALL AND MEDIUM ENTERPRISES (MSME) and National Skill Development Corporation (NSDC), 
                  we design impactful courses that blend industry expertise with innovation to empower learners. Our content remains 
                  relevant and insightful, helping individuals achieve their goals, make meaningful progress in their careers, and 
                  contribute to a skilled workforce. Additionally, we provide internship opportunities that offer hands-on experience, 
                  bridging the gap between theory and practice to prepare learners for real-world challenges.
                </p>
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
                  <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 animated-text">
                    <Sparkles className="w-5 h-5 text-blue-600 animated-icon" />
                    What We Deliver
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 animated-text">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 animated-icon" />
                      <span className="text-gray-700 font-medium">Industry-relevant curriculum</span>
                    </div>
                    <div className="flex items-center gap-3 animated-text">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 animated-icon" />
                      <span className="text-gray-700 font-medium">Hands-on project experience</span>
                    </div>
                    <div className="flex items-center gap-3 animated-text">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 animated-icon" />
                      <span className="text-gray-700 font-medium">Expert instructor guidance</span>
                    </div>
                    <div className="flex items-center gap-3 animated-text">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 animated-icon" />
                      <span className="text-gray-700 font-medium">Career support and mentorship</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vision */}
            <Card ref={visionRef} className="animated-card bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                    <Lightbulb className="w-8 h-8 text-white animated-icon" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-white animated-text">Our Expert Trainers</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <p className="text-lg text-blue-100 leading-relaxed animated-text">
                  Our trainers are industry experts with over 15 years of practical experience and a passion for teaching. 
                  They bring in-depth knowledge, real-world insights, and engaging teaching methods to every course. 
                  Dedicated to your success, they provide guidance, support, and inspiration, ensuring a fulfilling and 
                  effective learning experience for all our students.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 animated-text">
                    <div className="text-4xl font-bold mb-2 text-white">15+</div>
                    <div className="text-blue-200 font-medium">Years Experience</div>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 animated-text">
                    <div className="text-4xl font-bold mb-2 text-white">500+</div>
                    <div className="text-blue-200 font-medium">Students Trained</div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2 animated-text">
                    <Rocket className="w-5 h-5 animated-icon" />
                    Our Impact Goals
                  </h4>
                  <div className="space-y-2 text-blue-100">
                    <div className="flex items-center gap-2 animated-text">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span>Democratize access to quality tech education</span>
                    </div>
                    <div className="flex items-center gap-2 animated-text">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span>Bridge the global tech skills gap</span>
                    </div>
                    <div className="flex items-center gap-2 animated-text">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span>Empower underrepresented communities</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Student Success Stories Section */}
      <section className="px-4 lg:px-8 py-16 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Student Success Stories</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our students love the flexibility, expert-led courses, and practical knowledge they gain. They appreciate the interactive learning experience and the personalized support they receive. Many have shared how our courses helped them achieve their goals, boost their careers, or explore new passions. Their success stories inspire us to keep delivering excellence! With pride, we can say that we have successfully trained over 500 students, empowering them to make meaningful progress in their journeys.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="animated-card bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8 text-white animated-icon" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">500+ Students</h3>
                <p className="text-gray-600 leading-relaxed">
                  Successfully trained and empowered to make meaningful progress in their learning journeys.
                </p>
              </CardContent>
            </Card>

            <Card className="animated-card bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white animated-icon" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Student Satisfaction</h3>
                <p className="text-gray-600 leading-relaxed">
                  Students appreciate the flexibility, expert-led courses, and personalized support they receive.
                </p>
              </CardContent>
            </Card>

            <Card className="animated-card bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-8 h-8 text-white animated-icon" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Career Growth</h3>
                <p className="text-gray-600 leading-relaxed">
                  Many students have achieved their goals, boosted their careers, and explored new passions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="px-4 lg:px-8 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We offer a variety of services to support growth and success. Our Product Development brings innovative ideas to life, while Soft Skill Training enhances communication and leadership abilities. With IT Training, we ensure you&apos;re equipped with the latest tech knowledge. Our focus on Innovation and Entrepreneurship empowers creative ventures, and our Consultancy provides expert advice to help you achieve your goals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="animated-card bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Code className="w-8 h-8 text-white animated-icon" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Product Development</h3>
                <p className="text-gray-600 leading-relaxed">
                  Bring innovative ideas to life with our comprehensive product development services that cover the entire lifecycle from concept to deployment.
                </p>
              </CardContent>
            </Card>

            <Card className="animated-card bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-white animated-icon" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Soft Skill Training</h3>
                <p className="text-gray-600 leading-relaxed">
                  Enhance communication and leadership abilities with our specialized soft skills training programs designed for professional growth.
                </p>
              </CardContent>
            </Card>

            <Card className="animated-card bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Database className="w-8 h-8 text-white animated-icon" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">IT Training</h3>
                <p className="text-gray-600 leading-relaxed">
                  Stay equipped with the latest tech knowledge through our comprehensive IT training programs covering cutting-edge technologies.
                </p>
              </CardContent>
            </Card>

            <Card className="animated-card bg-gradient-to-br from-orange-50 to-orange-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Lightbulb className="w-8 h-8 text-white animated-icon" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Innovation & Entrepreneurship</h3>
                <p className="text-gray-600 leading-relaxed">
                  Empower creative ventures with our innovation and entrepreneurship programs that foster creative thinking and business development.
                </p>
              </CardContent>
            </Card>

            <Card className="animated-card bg-gradient-to-br from-pink-50 to-pink-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-600 to-pink-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Briefcase className="w-8 h-8 text-white animated-icon" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Consultancy</h3>
                <p className="text-gray-600 leading-relaxed">
                  Get expert advice and guidance to help you achieve your goals with our professional consultancy services tailored to your needs.
                </p>
              </CardContent>
            </Card>

            <Card className="animated-card bg-gradient-to-br from-cyan-50 to-cyan-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <GraduationCap className="w-8 h-8 text-white animated-icon" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Internship Opportunities</h3>
                <p className="text-gray-600 leading-relaxed">
                  Bridge the gap between theory and practice with hands-on internship opportunities that prepare you for real-world challenges.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      {/* <section className="px-4 lg:px-8 py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ready to start your learning journey? We&apos;re here to help you succeed.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="text-center bg-white border border-gray-200 rounded-lg p-8">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Email Support</h3>
              <p className="text-gray-600 mb-4">Get help with your courses and technical issues</p>
              <a 
                href="mailto:support@bravynex.com" 
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
              >
                support@bravynex.com
              </a>
            </div>

            <div className="text-center bg-white border border-gray-200 rounded-lg p-8">
              <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Live Chat</h3>
              <p className="text-gray-600 mb-4">Chat with our support team in real-time</p>
              <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-md transition-colors duration-200">
                Start Chat
              </Button>
            </div>

            <div className="text-center bg-white border border-gray-200 rounded-lg p-8">
              <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Community</h3>
              <p className="text-gray-600 mb-4">Join our vibrant learning community</p>
              <div className="flex justify-center gap-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Footer */}
      {/* <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">BRAVYNEX</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Empowering the next generation of developers with world-class technology education. 
                Learn, build, and grow with us.
              </p>
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <Linkedin className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <Github className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Learn</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-200">Programming</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Web Development</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Mobile Apps</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Data Science</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-200">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BRAVYNEX Engineering. All rights reserved.</p>
          </div>
        </div>
      </footer> */}
    </div>
  );
}

export default AboutPage;


