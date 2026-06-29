import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  MessageCircle,
  RefreshCcw,
  Send,
  Sparkles,
} from "lucide-react";
import Button from "../ui/Button";
import { createWhatsAppLink } from "../../utils/whatsapp";
import {
  getServiceExplorerRecommendation,
  serviceExplorerQuestions,
} from "../../data/serviceExplorerQuestions";
import { buildServiceExplorerContactUrl } from "../../utils/serviceExplorerLead";

export default function GuidedServiceExplorer() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = serviceExplorerQuestions[currentStep];
  const totalSteps = serviceExplorerQuestions.length;
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100);

  const recommendation = useMemo(
    () => getServiceExplorerRecommendation(answers),
    [answers]
  );

  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : null;
  const canContinue = Boolean(selectedAnswer);

  function selectAnswer(questionId, optionId) {
    setAnswers((current) => ({
      ...current,
      [questionId]: optionId,
    }));
  }

  function goNext() {
    if (!canContinue) return;

    if (currentStep === totalSteps - 1) {
      setShowResult(true);
      return;
    }

    setCurrentStep((step) => step + 1);
  }

  function goBack() {
    if (showResult) {
      setShowResult(false);
      setCurrentStep(totalSteps - 1);
      return;
    }

    setCurrentStep((step) => Math.max(0, step - 1));
  }

  function resetExplorer() {
    setCurrentStep(0);
    setAnswers({});
    setShowResult(false);
  }

  const whatsappMessage = buildRecommendationMessage(recommendation);

  return (
    <section className="rounded-[2rem] border border-cyan-300/20 bg-[#061A33]/90 p-5 shadow-2xl lg:p-7">
      <div className="flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-200">
            <Sparkles size={15} />
            Guided Service Explorer
          </div>

          <h3 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
            Let MKETICS recommend your best starting point.
          </h3>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            Answer 7 quick questions and get a practical recommendation based
            on your business need, stage, challenge, budget direction and
            timeline.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
          <p className="text-3xl font-black text-cyan-200">{progress}%</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Progress
          </p>
        </div>
      </div>

      {!showResult ? (
        <div className="mt-7">
          <div className="mb-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-300">
                Question {currentStep + 1} of {totalSteps}
              </p>

              <button
                type="button"
                onClick={resetExplorer}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-slate-300 transition hover:border-cyan-300/50 hover:text-white"
              >
                <RefreshCcw size={14} />
                Reset
              </button>
            </div>

            <h4 className="mt-4 text-2xl font-black text-white">
              {currentQuestion.question}
            </h4>

            <p className="mt-2 text-sm leading-7 text-slate-300">
              {currentQuestion.helper}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswer === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => selectAnswer(currentQuestion.id, option.id)}
                  className={`rounded-2xl border p-5 text-left transition ${
                    isSelected
                      ? "border-cyan-300 bg-cyan-300 text-[#061A33] shadow-[0_0_28px_rgba(103,232,249,0.22)]"
                      : "border-white/10 bg-white/[0.04] text-white hover:border-cyan-300/60 hover:bg-white/[0.07]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border ${
                        isSelected
                          ? "border-[#061A33] bg-[#061A33] text-cyan-200"
                          : "border-cyan-300/40 text-cyan-300"
                      }`}
                    >
                      {isSelected ? <CheckCircle2 size={16} /> : null}
                    </span>

                    <span className="font-black leading-snug">
                      {option.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={goBack}
              disabled={currentStep === 0}
              className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm font-black text-white transition hover:border-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </button>

            <button
              type="button"
              onClick={goNext}
              disabled={!canContinue}
              className="inline-flex items-center justify-center rounded-full bg-cyan-300 px-6 py-3 text-sm font-black text-[#061A33] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {currentStep === totalSteps - 1
                ? "View Recommendation"
                : "Next Question"}
              <ArrowRight size={16} className="ml-2" />
            </button>
          </div>
        </div>
      ) : (
        <RecommendationResult
          recommendation={recommendation}
          whatsappMessage={whatsappMessage}
          onBack={goBack}
          onReset={resetExplorer}
        />
      )}
    </section>
  );
}

function RecommendationResult({
  recommendation,
  whatsappMessage,
  onBack,
  onReset,
}) {
  const primaryService = recommendation.primaryService;
  const supportingServices = recommendation.supportingServices;
  const contactUrl = buildServiceExplorerContactUrl(recommendation);

  return (
    <div className="mt-7">
      <div className="rounded-[2rem] border border-cyan-300/25 bg-cyan-300/10 p-6">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-300 text-[#061A33]">
            <ClipboardList size={24} />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">
              Recommended Solution
            </p>
            <h4 className="mt-1 text-2xl font-black text-white">
              {primaryService?.title}
            </h4>
          </div>
        </div>

        <p className="mt-5 text-sm leading-7 text-slate-300">
          {primaryService?.summary}
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <ResultInfo
            label="Why this fits"
            text={recommendation.whyThisFits}
          />
          <ResultInfo
            label="Suggested starting point"
            text={recommendation.suggestedStartingPoint}
          />
          <ResultInfo
            label="Service pillar"
            text={recommendation.servicePillar}
          />
          <ResultInfo
            label="Estimated readiness level"
            text={recommendation.readinessLevel}
          />
        </div>
      </div>

      {supportingServices.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-300">
            Supporting MKETICS Services
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {supportingServices.map((service) => (
              <article
                key={service.title}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
              >
                <h5 className="font-black text-white">{service.title}</h5>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {service.summary}
                </p>
              </article>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-slate-400">
          Your Selected Answers
        </p>

        <div className="mt-4 grid gap-3">
          {recommendation.selectedAnswerLabels.map((item) => (
            <div
              key={`${item.question}-${item.answer}`}
              className="rounded-2xl border border-white/10 bg-[#020B1F]/40 p-4"
            >
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
                {item.question}
              </p>
              <p className="mt-2 text-sm text-slate-200">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-3 lg:flex-row">
        <Button to={contactUrl} className="justify-center">
          Request a Quote Based on This Recommendation
          <Send size={16} className="ml-2" />
        </Button>

        <a
          href={createWhatsAppLink(whatsappMessage)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-full border border-cyan-300/40 bg-white/[0.06] px-6 py-3 text-sm font-black text-white transition hover:border-cyan-300 hover:bg-cyan-300 hover:text-[#061A33]"
        >
          <MessageCircle size={17} className="mr-2" />
          Send Recommendation on WhatsApp
        </a>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm font-black text-white transition hover:border-cyan-300/60"
        >
          <ArrowLeft size={16} className="mr-2" />
          Edit Last Answer
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm font-black text-slate-300 transition hover:border-cyan-300/60 hover:text-white"
        >
          <RefreshCcw size={16} className="mr-2" />
          Start Again
        </button>
      </div>
    </div>
  );
}

function ResultInfo({ label, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#020B1F]/45 p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
    </div>
  );
}

function buildRecommendationMessage(recommendation) {
  const primary = recommendation.primaryService?.title || "MKETICS service";

  const supporting = recommendation.supportingServices
    .map((service) => `- ${service.title}`)
    .join("\n");

  const answers = recommendation.selectedAnswerLabels
    .map((item) => `- ${item.question}: ${item.answer}`)
    .join("\n");

  return `Hello MKETICS, I completed the Service Explorer.

Recommended solution: ${primary}
Service pillar: ${recommendation.servicePillar}
Readiness level: ${recommendation.readinessLevel}

Supporting services:
${supporting || "- Not applicable"}

My answers:
${answers}

Please assist me with the next step, scope and pricing direction.`;
}