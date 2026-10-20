import { motion, useReducedMotion } from "framer-motion";

const revealEase = [0.16, 1, 0.3, 1];

export const Reveal = ({
  children,
  className = "",
  delay = 0,
  distance = 12,
  once = true,
  ...props
}) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.18 }}
      transition={{ duration: reduceMotion ? 0 : 0.42, delay, ease: revealEase }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const Stagger = ({ children, className = "", delay = 0 }) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.18 }}
      variants={{
        hidden: {},
        show: {
          transition: {
            delayChildren: delay,
            staggerChildren: reduceMotion ? 0 : 0.07,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children, className = "" }) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={
        reduceMotion
          ? undefined
          : { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }
      }
      transition={{ duration: reduceMotion ? 0 : 0.35, ease: revealEase }}
    >
      {children}
    </motion.div>
  );
};
