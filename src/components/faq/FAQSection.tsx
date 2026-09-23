import { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import styles from './FAQSection.module.css';

interface FAQItem {
  question: string;
  answer: string;
  booking?: boolean;
}

const faqs: FAQItem[] = [
  {
    question: 'How can I book an airport transfer or private journey?',
    answer:
      'Enter your pickup location, destination, travel date and time in the online booking form. You can add an extra stop, provide passenger and luggage details, select a vehicle and review your fare before confirming your journey.',
    booking: true,
  },
  {
    question: 'Can I get an airport taxi quote online?',
    answer:
      'Yes. Start your journey details through the online booking form and your available vehicle options and fare will be presented during the booking process before you confirm.',
    booking: true,
  },
  {
    question: 'How far in advance can I book a private transfer?',
    answer:
      'You can plan your journey in advance through the online booking process. For airport arrivals, bookings must be made at least 4 hours before the scheduled arrival time.',
  },
  {
    question: 'Can I book an early morning or late-night transfer?',
    answer:
      'You can enter the required pickup date and time when making your booking. This allows your journey requirements to be provided clearly before confirmation.',
    booking: true,
  },
  {
    question: 'What types of private transport can I book?',
    answer:
      'The service supports airport transfers, railway station journeys, cruise terminal transfers, event transport, group journeys and other private transport requirements across England.',
  },
  {
    question: 'Which vehicle should I choose for my journey?',
    answer:
      'Vehicle choice depends on your passenger numbers, luggage and the type of journey you are planning. Available categories include saloon, estate, MPV, executive and 8-seater vehicles.',
  },
  {
    question: 'Can I include luggage in my booking?',
    answer:
      'Yes. Luggage information can be provided as part of your journey details so the vehicle selection can reflect your practical travel requirements.',
  },
  {
    question: 'Can I add an extra stop to my journey?',
    answer:
      'Yes. The booking journey includes an option to add an extra stop when your route requires one.',
  },
  {
    question: 'Can I book an airport transfer to a railway station?',
    answer:
      'Yes. Private transport can be arranged between airports, railway stations and other destinations. Enter the relevant pickup and destination details when requesting your journey.',
    booking: true,
  },
  {
    question: 'Do you provide cruise terminal transfers?',
    answer:
      'Yes. Cruise terminal transfers are part of the private transport service. You can provide your pickup, destination and journey details through the booking process.',
    booking: true,
  },
  {
    question: 'Can I arrange transport for a wedding or event?',
    answer:
      'Yes. Event and bespoke transport requirements can be submitted through the quote request service. This is suitable for journeys that need more than a standard booking.',
  },
  {
    question: 'When will I see the price for my journey?',
    answer:
      'Your fare is presented during the vehicle selection stage of the booking journey, allowing you to review the available option and price before confirmation.',
  },
  {
    question: 'Does the vehicle category affect the fare?',
    answer:
      'Yes. Different vehicle categories can have different fares. The available vehicle options and applicable fare are shown during the booking process.',
  },
  {
    question: 'How can I pay for my booking?',
    answer:
      'Online payments are processed securely through Stripe. The booking journey takes you through the payment and confirmation process.',
  },
  {
    question: 'Do I need to pay before my journey?',
    answer:
      'Yes. Full payment is required before the journey is confirmed for standard bookings and event transport.',
  },
  {
    question: 'Can I change my booking after confirmation?',
    answer:
      'If your journey details need to change, contact the support team with your booking information so the request can be reviewed.',
  },
  {
    question: 'Can I cancel my booking?',
    answer:
      'Cancellation requests are handled according to the applicable booking and refund terms. Check the current refund policy or contact support if you need help with a specific booking.',
  },
  {
    question: 'What information do I need to make a booking?',
    answer:
      'You will need your pickup location, destination, travel date and time, passenger details and relevant luggage information. You can also add an extra stop where required.',
    booking: true,
  },
  {
    question: 'Can someone else make the booking for me?',
    answer:
      'Yes. A booking can be arranged using the journey and passenger information required for the person travelling. Make sure the lead passenger and contact details are accurate.',
    booking: true,
  },
  {
    question: 'What if I need help while making my booking?',
    answer:
      'The booking process is designed to present the journey information clearly. If you need additional assistance, you can use the available contact and support options on the website.',
  },
  {
    question: 'Can I use the service for business travel?',
    answer:
      'Yes. Private transport can be used for business journeys, airport travel, railway station transfers, meetings, events and other planned journeys.',
  },
  {
    question: 'Can I book transport for a group?',
    answer:
      'Yes. Vehicle categories include larger options such as MPVs and 8-seaters. For larger or more specialised requirements, you can also request a custom quote.',
    booking: true,
  },
  {
    question: 'Can I book a return airport transfer?',
    answer:
      'Yes. You can arrange your required journey details through the booking process. For more complex or bespoke return requirements, the quote service is also available.',
    booking: true,
  },
  {
    question: 'Where in England can I book private transport?',
    answer:
      'The platform is designed for private transport journeys across England, including airport, railway, cruise, event and other destination-based transfers.',
  },
  {
    question: 'Why should I book my airport transfer in advance?',
    answer:
      'Booking in advance gives you time to enter your journey details, select a suitable vehicle, review the fare and complete payment before your planned journey.',
    booking: true,
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const toggleFAQ = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section id="faqs" className={styles.section} aria-labelledby="faq-heading">
      <div className={styles.inner}>
        <div className={styles.headingArea}>
          <div className={styles.headingCopy}>
            <span className={styles.eyebrow}>FREQUENTLY ASKED QUESTIONS</span>
            <h2 id="faq-heading">
              Everything you need to know
              <span>before you travel.</span>
            </h2>
            <p>
              Find clear answers about airport transfers, private transport,
              vehicles, luggage, fares, payment and booking journeys across England.
            </p>
          </div>

          <a href="#booking" className={styles.headingAction}>
            Book your journey
            <ArrowRight size={17} strokeWidth={2} />
          </a>
        </div>

        <div className={styles.faqLayout}>
          <div className={styles.introPanel}>
            <span className={styles.panelNumber}>01</span>
            <strong>Planning your journey?</strong>
            <p>
              Start with your route and travel time. The booking process guides
              you through the important details before confirmation.
            </p>
            <a href="#booking" className={styles.panelLink}>
              Start booking
              <ArrowRight size={16} />
            </a>
          </div>

          <div className={styles.list} itemScope itemType="https://schema.org/FAQPage">
            {faqs.slice(0, showAll ? faqs.length : 5).map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <article
                  key={faq.question}
                  className={`${styles.item} ${isOpen ? styles.itemOpen : ''}`}
                  itemScope
                  itemProp="mainEntity"
                  itemType="https://schema.org/Question"
                >
                  <button
                    type="button"
                    className={styles.question}
                    onClick={() => toggleFAQ(index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span className={styles.index}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className={styles.questionText} itemProp="name">
                      {faq.question}
                    </span>
                    <span className={styles.icon}>
                      <ChevronDown size={19} strokeWidth={1.8} />
                    </span>
                  </button>

                  <div
                    id={`faq-answer-${index}`}
                    className={styles.answerWrap}
                    aria-hidden={!isOpen}
                  >
                    <div className={styles.answer} itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                      <div itemProp="text">
                        <p>{faq.answer}</p>

                        {faq.booking && (
                          <a href="#booking" className={styles.answerAction}>
                            Book your journey
                            <ArrowRight size={15} strokeWidth={2} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className={styles.viewAllWrap}>
          <button
            type="button"
            className={styles.viewAll}
            onClick={() => {
              setShowAll((current) => !current);
              setOpenIndex(null);
            }}
          >
            <span>{showAll ? 'Show fewer questions' : 'View all FAQs'}</span>
            <ChevronDown
              size={17}
              className={showAll ? styles.viewAllIconOpen : ''}
            />
          </button>

          <span className={styles.questionCount}>
            {showAll ? `${faqs.length} questions` : `5 of ${faqs.length} questions`}
          </span>
        </div>

        <div className={styles.bottomCta}>
          <div>
            <span>READY WHEN YOU ARE</span>
            <strong>Plan your next private journey.</strong>
          </div>
          <a href="#booking">
            Book now
            <ArrowRight size={17} strokeWidth={2} />
          </a>
        </div>
      </div>
    </section>
  );
}
