'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Tractor, MapPin, X } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  const handleAddClick = () => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push('/sign-in');
      return;
    }
    setIsOpen(!isOpen);
  };

  const actions = [
    {
      icon: <Tractor className="w-5 h-5" />,
      label: 'إضافة معدات',
      href: '/equipment/new',
      color: 'from-emerald-500 to-green-500'
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: 'إضافة أرض',
      href: '/land/new',
      color: 'from-blue-500 to-cyan-500'
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-16 right-0 space-y-3"
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={action.href}>
                  <button
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 bg-gradient-to-r ${action.color} text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group`}
                  >
                    <span className="text-sm font-medium">{action.label}</span>
                    <div className="group-hover:scale-110 transition-transform duration-200">
                      {action.icon}
                    </div>
                  </button>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleAddClick}
        className={`w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600'
        }`}
      >
        <AnimatePresence>
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90 }}
              animate={{ rotate: 0 }}
              exit={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="add"
              initial={{ rotate: 90 }}
              animate={{ rotate: 0 }}
              exit={{ rotate: -90 }}
              transition={{ duration: 0.2 }}
            >
              <Plus className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default FloatingActionButton;
