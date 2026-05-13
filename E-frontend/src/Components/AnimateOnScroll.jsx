import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

/**
 * A component that animates its children when they scroll into view.
 * * PROPS:
 * - animationType: "fade-up" (default), "fade-left", "fade-right", "zoom-in"
 * - duration: The animation duration in seconds (default: 0.6)
 * - delay: The animation delay in seconds (default: 0)
 * - threshold: How much of the element (0 to 1) must be visible to trigger (default: 0.1)
 * - triggerOnce: Only animate once (default: true)
 */
export default function AnimateOnScroll({
     children,
     animationType = "fade-up",
     duration = 0.6,
     delay = 0,
     threshold = 0.1,
     triggerOnce = true
}) {

     const { ref, inView } = useInView({
          threshold: threshold,
          triggerOnce: triggerOnce,
     });

     let variants;

     // Define different animations based on the 'animationType' prop
     // These values (like 100px and 0.8 scale) are taken 
     // directly from the AOS CSS you provided.
     switch (animationType) {
          case "fade-left":
               variants = {
                    hidden: { opacity: 0, x: 100 },
                    visible: { opacity: 1, x: 0 },
               };
               break;
          case "fade-right":
               variants = {
                    hidden: { opacity: 0, x: -100 },
                    visible: { opacity: 1, x: 0 },
               };
               break;
          case "zoom-in":
               variants = {
                    hidden: { opacity: 0, scale: 0.8 },
                    visible: { opacity: 1, scale: 1 },
               };
               break;
          case "fade-up":
          default:
               variants = {
                    // This now matches your [data-aos=fade-up] style
                    hidden: { opacity: 0, y: 100 },
                    visible: { opacity: 1, y: 0 },
               };
               break;
     }

     return (
          <motion.div
               ref={ref}
               initial="hidden"
               animate={inView ? "visible" : "hidden"}
               variants={variants}
               transition={{
                    duration: duration,
                    delay: delay,
                    ease: "easeOut"
               }}
          >
               {children}
          </motion.div>
     );
}