import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import styles from "./WhatsAppFloat.module.css";

const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined)?.replace(/\D/g, "") || "";

export function WhatsAppFloat() {
  const [showBubble, setShowBubble] = useState(true);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => setShowBubble(false), 6500);

    const interval = window.setInterval(() => {
      setShowBubble(true);
      window.setTimeout(() => setShowBubble(false), 6000);
    }, 18000);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, []);

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello, I would like help with my journey.")}`
    : "#";

  const handleClick = () => {
    if (!whatsappNumber) return;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.bubble} ${showBubble ? styles.bubbleVisible : ""}`}
        role="status"
        aria-live="polite"
      >
        <button
          type="button"
          className={styles.close}
          onClick={() => setShowBubble(false)}
          aria-label="Close WhatsApp message"
        >
          <X size={13} />
        </button>

        <span className={styles.bubbleKicker}>NEED HELP?</span>
        <strong>Chat with our team</strong>
        <span className={styles.bubbleText}>We are here to help with your journey.</span>
      </div>

      <button
        type="button"
        className={styles.orb}
        onClick={handleClick}
        aria-label="Chat with us on WhatsApp"
        disabled={!whatsappNumber}
      >
        <span className={styles.orbRing} />
        <span className={styles.orbIcon}>
          <MessageCircle size={29} strokeWidth={2.4} />
        </span>
        <span className={styles.orbPulse} />
      </button>

      <span className={styles.label}>WhatsApp</span>
    </div>
  );
}
