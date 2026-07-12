import { MessageCircle, X, Send } from "lucide-react";
import { useState } from "react";
import Button from "../ui/Button";
import { createWhatsAppLink, whatsappMessages } from "../../utils/whatsapp";
import { trackEvent } from "../../utils/analytics";

export default function FloatingContactCTA() {
  const [isOpen, setIsOpen] = useState(false);

  function handleToggle() {
    setIsOpen((current) => {
      trackEvent("floating_contact_toggle", {
        action: current ? "close" : "open",
        location: "floating_contact_widget",
      });

      return !current;
    });
  }

  function handleClose() {
    trackEvent("floating_contact_toggle", {
      action: "close",
      location: "floating_contact_widget",
    });

    setIsOpen(false);
  }

  function handleWhatsAppClick() {
    trackEvent("whatsapp_click", {
      location: "floating_contact_widget",
      lead_source: "floating_contact_widget",
    });
  }

  function handleQuoteClick() {
    trackEvent("quote_cta_click", {
      location: "floating_contact_widget",
      lead_source: "floating_contact_widget",
    });

    setIsOpen(false);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 hidden md:block">
      {isOpen && (
        <div className="mb-4 w-[310px] overflow-hidden rounded-[1.5rem] border border-cyan-300/25 bg-[#020B1F]/95 text-white shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="relative overflow-hidden p-5">
            <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-cyan-300/15 blur-3xl" />

            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
                  Need Help?
                </p>

                <h3 className="mt-2 text-xl font-black text-white">
                  Talk to MKETICS
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Request a quote, ask a question or start a WhatsApp
                  conversation.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300"
                aria-label="Close MKETICS contact menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative mt-5 grid gap-3">
              <a
                href={createWhatsAppLink(whatsappMessages.general)}
                target="_blank"
                rel="noreferrer"
                onClick={handleWhatsAppClick}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-[#061A33] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-[#020B1F]"
              >
                <MessageCircle size={17} />
                WhatsApp MKETICS
              </a>

              <Button
                to="/contact"
                onClick={handleQuoteClick}
                className="justify-center"
              >
                Request Quote
                <Send size={17} className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleToggle}
        className="group grid h-16 w-16 place-items-center rounded-full border border-cyan-300/40 bg-cyan-300 text-[#020B1F] shadow-[0_0_45px_rgba(25,217,255,0.45)] transition hover:scale-105 hover:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-[#020B1F]"
        aria-label={
          isOpen ? "Close MKETICS contact menu" : "Open MKETICS contact menu"
        }
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X size={28} />
        ) : (
          <MessageCircle size={30} className="transition group-hover:scale-110" />
        )}
      </button>
    </div>
  );
}