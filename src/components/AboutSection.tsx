'use client';

import { motion } from 'framer-motion';
import { FiShoppingBag, FiMapPin, FiUsers, FiTrendingUp, FiCheckCircle, FiSearch, FiStar } from 'react-icons/fi';

export default function AboutSection() {
  const features = [
    {
      icon: FiMapPin,
      title: 'Local Business Discovery',
      description: 'Apne shehar ke har corner ki verified shops, restaurants, hotels aur doctors ko dhundo',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      icon: FiCheckCircle,
      title: 'Verified & Trusted',
      description: 'Har business ko verify kiya jata hai taaki aapko trusted services mile',
      color: 'from-green-600 to-emerald-600'
    },
    {
      icon: FiUsers,
      title: 'Community Powered',
      description: 'Real users ke reviews aur ratings se best businesses find karo',
      color: 'from-purple-600 to-pink-600'
    },
    {
      icon: FiTrendingUp,
      title: 'Digital Empowerment',
      description: 'Chhoti dukano ko digital platform provide karke unhe grow karne me help',
      color: 'from-orange-600 to-red-600'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Verified Businesses', icon: FiShoppingBag },
    { number: '50,000+', label: 'Happy Users', icon: FiUsers },
    { number: '100+', label: 'Cities Covered', icon: FiMapPin },
    { number: '4.8/5', label: 'Average Rating', icon: FiStar }
  ];

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-300 dark:bg-yellow-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-300 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.h2 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
          >
            8rupiya.com ke bare mein
          </motion.h2>
          <motion.p 
            className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto font-medium"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            India ka sabse trusted aur fastest growing local business discovery platform
          </motion.p>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Left Column - Main Description */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                <FiShoppingBag className="text-blue-600 dark:text-blue-400" />
                Kya hai 8rupiya.com?
              </h3>
              <div className="space-y-4 text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                <p>
                  <strong className="text-gray-900 dark:text-white">8rupiya.com</strong> ek local business discovery platform hai jahan users apne shehar ke verified shops, restaurants, hotels, doctors aur services aasani se dhondh sakte hain. Hum India ke har shehar aur gaon ki chhoti badi dukano ko ek digital platform provide karte hain.
                </p>
                <p>
                  Aaj ke digital zamane mein, har business ko online presence ki zarurat hai. Lekin bahut saare chhote shopkeepers ke paas time aur resources nahi hote apni website banane ke liye. <strong className="text-blue-600 dark:text-blue-400">Yahi problem 8rupiya.com solve karta hai</strong> - hum local businesses ko free mein list karte hain aur unhe millions of customers tak pahunchate hain.
                </p>
                <p>
                  Chahe aapko paas ka best restaurant dhundna ho, reliable doctor find karna ho, ya phir apne area ki trusted shops explore karni ho - <strong className="text-purple-600 dark:text-purple-400">8rupiya.com par sab kuch mil jayega</strong>. Har business verified hai, ratings aur reviews real users ke hain, aur contact information bilkul accurate hai.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Features */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Kyun choose karein 8rupiya.com?
            </h3>
            
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${feature.color} shadow-lg`}>
                    <feature.icon className="text-2xl text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Detailed Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 md:p-12 shadow-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              8rupiya.com ki khas baat kya hai?
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8 text-gray-700 dark:text-gray-300">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FiCheckCircle className="text-green-600 dark:text-green-400 text-xl flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Bilkul Free Hai</h4>
                    <p className="text-base">Users ke liye completely free - koi hidden charges nahi. Shops browse karo, contact karo, reviews padho - sab free.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FiCheckCircle className="text-green-600 dark:text-green-400 text-xl flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Real Reviews & Ratings</h4>
                    <p className="text-base">Fake reviews nahi, sirf real users ki authentic feedback. Aap bhi apna experience share kar sakte ho.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FiCheckCircle className="text-green-600 dark:text-green-400 text-xl flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Smart Search System</h4>
                    <p className="text-base">Category, location, ratings se filter karo. Jo chahiye wo turant mil jaye - bahut fast aur accurate.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FiCheckCircle className="text-green-600 dark:text-green-400 text-xl flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Complete Business Info</h4>
                    <p className="text-base">Phone number, address, timings, photos - sab kuch ek jagah. Time waste nahi, direct contact karo.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FiCheckCircle className="text-green-600 dark:text-green-400 text-xl flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Mobile Friendly</h4>
                    <p className="text-base">Phone, tablet, computer - kisi pe bhi use karo. Fast loading, smooth experience guaranteed.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FiCheckCircle className="text-green-600 dark:text-green-400 text-xl flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Support Local Businesses</h4>
                    <p className="text-base">Jab aap 8rupiya use karte ho, toh aap apne local shopkeepers ki help karte ho grow karne mein.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FiCheckCircle className="text-green-600 dark:text-green-400 text-xl flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Regular Updates</h4>
                    <p className="text-base">Naye features aate rehte hain. Hum continuously platform ko better banate hain.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FiCheckCircle className="text-green-600 dark:text-green-400 text-xl flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Safe & Secure</h4>
                    <p className="text-base">Aapki privacy hamari priority hai. Data protection aur security best practices follow karte hain.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 text-center"
            >
              <stat.icon className="text-4xl text-blue-600 dark:text-blue-400 mx-auto mb-3" />
              <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {stat.number}
              </div>
              <div className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 md:p-12 shadow-2xl">
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-4">
              Shuru karein apna local business journey!
            </h3>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Apne area ki best shops discover karein ya apna business list karein - dono bilkul free hai!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="#main-content"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all inline-flex items-center justify-center gap-2"
              >
                <FiSearch className="text-xl" />
                Shops Explore Karein
              </motion.a>
              <motion.a
                href="/add-shop"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all inline-flex items-center justify-center gap-2"
              >
                <FiShoppingBag className="text-xl" />
                Apna Business Add Karein
              </motion.a>
            </div>
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-4xl mx-auto leading-relaxed">
            <strong className="text-gray-900 dark:text-white">8rupiya.com</strong> sirf ek website nahi hai - yeh ek movement hai jo India ke local businesses ko empower kar raha hai. Chahe aap ek customer ho jo trusted services dhundh raha hai, ya ek shopkeeper ho jo apne business ko online le jana chahta hai - <strong className="text-blue-600 dark:text-blue-400">8rupiya.com aapke liye hai</strong>. Join karein India ke sabse growing local business community ko aur baniye iss digital revolution ka hissa!
          </p>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}

