import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Anchor,
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Coins,
  Dices,
  Fish,
  GraduationCap,
  Heart,
  HelpCircle,
  MapPin,
  Package,
  Search,
  Ship,
  Skull,
  Target,
  Trophy,
  Waves,
} from 'lucide-react';
import { useLanguage, getTranslations, type Language } from '@/context/LanguageContext';

// ============================================================================
// TUTORIAL DATA
// ============================================================================

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  icon: React.ReactNode;
  tips?: string[];
}

const getTutorialSteps = (language: Language): TutorialStep[] => {
  const trans = getTranslations(language);
  const tutorial = trans.tutorial as unknown as Record<string, { title: string; content: string; tips: string[] }>;

  return [
    {
      id: 'welcome',
      title: tutorial.welcome.title,
      content: tutorial.welcome.content,
      icon: <Ship className="h-6 w-6" />,
      tips: tutorial.welcome.tips,
    },
    {
      id: 'dice',
      title: tutorial.dice.title,
      content: tutorial.dice.content,
      icon: <Dices className="h-6 w-6" />,
      tips: tutorial.dice.tips,
    },
    {
      id: 'sea',
      title: tutorial.sea.title,
      content: tutorial.sea.content,
      icon: <Waves className="h-6 w-6" />,
      tips: tutorial.sea.tips,
    },
    {
      id: 'fishing',
      title: tutorial.fishing.title,
      content: tutorial.fishing.content,
      icon: <Fish className="h-6 w-6" />,
      tips: tutorial.fishing.tips,
    },
    {
      id: 'mounting',
      title: tutorial.mounting.title,
      content: tutorial.mounting.content,
      icon: <Trophy className="h-6 w-6" />,
      tips: tutorial.mounting.tips,
    },
    {
      id: 'port',
      title: tutorial.port.title,
      content: tutorial.port.content,
      icon: <Anchor className="h-6 w-6" />,
      tips: tutorial.port.tips,
    },
    {
      id: 'regrets',
      title: tutorial.regrets.title,
      content: tutorial.regrets.content,
      icon: <Brain className="h-6 w-6" />,
      tips: tutorial.regrets.tips,
    },
    {
      id: 'phases',
      title: tutorial.phases.title,
      content: tutorial.phases.content,
      icon: <CircleDot className="h-6 w-6" />,
      tips: tutorial.phases.tips,
    },
    {
      id: 'scoring',
      title: tutorial.scoring.title,
      content: tutorial.scoring.content,
      icon: <Target className="h-6 w-6" />,
      tips: tutorial.scoring.tips,
    },
    {
      id: 'tips',
      title: tutorial.tips.title,
      content: tutorial.tips.content,
      icon: <GraduationCap className="h-6 w-6" />,
      tips: tutorial.tips.tips,
    },
  ];
};

// ============================================================================
// RULEBOOK DATA
// ============================================================================

interface RulebookSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string;
  keywords: string[];
}

const getRulebookSections = (language: Language): RulebookSection[] => {
  const trans = getTranslations(language);
  const rulebook = trans.rulebook as unknown as Record<string, { title: string; content: string; keywords: string[] }>;

  return [
    {
      id: 'overview',
      title: rulebook.overview.title,
      icon: <BookOpen className="h-5 w-5" />,
      keywords: rulebook.overview.keywords,
      content: rulebook.overview.content,
    },
    {
      id: 'dice',
      title: rulebook.dice.title,
      icon: <Dices className="h-5 w-5" />,
      keywords: rulebook.dice.keywords,
      content: rulebook.dice.content,
    },
    {
      id: 'sea',
      title: rulebook.sea.title,
      icon: <Waves className="h-5 w-5" />,
      keywords: rulebook.sea.keywords,
      content: rulebook.sea.content,
    },
    {
      id: 'fishing',
      title: rulebook.fishing.title,
      icon: <Fish className="h-5 w-5" />,
      keywords: rulebook.fishing.keywords,
      content: rulebook.fishing.content,
    },
    {
      id: 'mounting',
      title: rulebook.mounting.title,
      icon: <Trophy className="h-5 w-5" />,
      keywords: rulebook.mounting.keywords,
      content: rulebook.mounting.content,
    },
    {
      id: 'port',
      title: rulebook.port.title,
      icon: <Anchor className="h-5 w-5" />,
      keywords: rulebook.port.keywords,
      content: rulebook.port.content,
    },
    {
      id: 'regrets',
      title: rulebook.regrets.title,
      icon: <Skull className="h-5 w-5" />,
      keywords: rulebook.regrets.keywords,
      content: rulebook.regrets.content,
    },
    {
      id: 'phases',
      title: rulebook.phases.title,
      icon: <CircleDot className="h-5 w-5" />,
      keywords: rulebook.phases.keywords,
      content: rulebook.phases.content,
    },
    {
      id: 'theplug',
      title: rulebook.theplug.title,
      icon: <MapPin className="h-5 w-5" />,
      keywords: rulebook.theplug.keywords,
      content: rulebook.theplug.content,
    },
    {
      id: 'scoring',
      title: rulebook.scoring.title,
      icon: <Target className="h-5 w-5" />,
      keywords: rulebook.scoring.keywords,
      content: rulebook.scoring.content,
    },
    {
      id: 'characters',
      title: rulebook.characters.title,
      icon: <Heart className="h-5 w-5" />,
      keywords: rulebook.characters.keywords,
      content: rulebook.characters.content,
    },
    {
      id: 'resources',
      title: rulebook.resources.title,
      icon: <Coins className="h-5 w-5" />,
      keywords: rulebook.resources.keywords,
      content: rulebook.resources.content,
    },
    {
      id: 'upgrades',
      title: rulebook.upgrades.title,
      icon: <Package className="h-5 w-5" />,
      keywords: rulebook.upgrades.keywords,
      content: rulebook.upgrades.content,
    },
  ];
};

// ============================================================================
// TUTORIAL COMPONENT
// ============================================================================

interface TutorialProps {
  onComplete?: () => void;
}

const Tutorial = ({ onComplete }: TutorialProps) => {
  const { language, t } = useLanguage();
  const tutorialSteps = useMemo(() => getTutorialSteps(language), [language]);

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const step = tutorialSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const handleNext = () => {
    setCompletedSteps((prev) => new Set([...prev, step.id]));
    if (isLastStep) {
      onComplete?.();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Progress bar */}
      <div className="mb-4 flex items-center gap-1">
        {tutorialSteps.map((s, index) => (
          <button
            key={s.id}
            onClick={() => handleStepClick(index)}
            className={`h-2 flex-1 rounded-full transition-all ${
              index === currentStep
                ? 'bg-primary'
                : completedSteps.has(s.id)
                  ? 'bg-primary/50'
                  : 'bg-white/20'
            }`}
            title={s.title}
          />
        ))}
      </div>

      {/* Step counter */}
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {t('common.step')} {currentStep + 1} {t('common.of')} {tutorialSteps.length}
        </span>
        <span>{Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}% {language === 'no' ? 'fullført' : 'complete'}</span>
      </div>

      {/* Content area */}
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary">
              {step.icon}
            </div>
            <h3 className="text-xl font-bold text-primary-glow">{step.title}</h3>
          </div>

          {/* Main content */}
          <div className="prose prose-invert prose-sm max-w-none">
            {step.content.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-sm leading-relaxed text-foreground/90">
                {paragraph.split('**').map((part, j) =>
                  j % 2 === 1 ? (
                    <strong key={j} className="text-primary-glow">
                      {part}
                    </strong>
                  ) : (
                    part
                  )
                )}
              </p>
            ))}
          </div>

          {/* Tips */}
          {step.tips && step.tips.length > 0 && (
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                <HelpCircle className="h-4 w-4" />
                {t('common.tips')}
              </h4>
              <ul className="space-y-1">
                {step.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <ArrowRight className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Navigation */}
      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep}
          className="border-white/30"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {t('common.previous')}
        </Button>

        <div className="flex items-center gap-2">
          {completedSteps.size === tutorialSteps.length && (
            <Badge className="bg-green-500/20 text-green-400">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              {t('common.completed')}
            </Badge>
          )}
        </div>

        <Button onClick={handleNext} className="btn-ocean">
          {isLastStep ? (
            <>
              {t('common.complete')}
              <CheckCircle2 className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              {t('common.next')}
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// RULEBOOK COMPONENT
// ============================================================================

const Rulebook = () => {
  const { language, t } = useLanguage();
  const rulebookSections = useMemo(() => getRulebookSections(language), [language]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return rulebookSections;

    const query = searchQuery.toLowerCase();
    return rulebookSections.filter(
      (section) =>
        section.title.toLowerCase().includes(query) ||
        section.content.toLowerCase().includes(query) ||
        section.keywords.some((kw) => kw.includes(query))
    );
  }, [searchQuery, rulebookSections]);

  return (
    <div className="flex h-full flex-col">
      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t('help.searchRulebook')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Results count */}
      {searchQuery && (
        <div className="mb-2 text-xs text-muted-foreground">
          {filteredSections.length} {filteredSections.length !== 1 ? t('common.results') : t('common.result')} {t('common.found')}
        </div>
      )}

      {/* Sections */}
      <ScrollArea className="flex-1 pr-4">
        {filteredSections.length > 0 ? (
          <Accordion type="multiple" className="space-y-2">
            {filteredSections.map((section) => (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="rounded-lg border border-white/10 bg-white/5 px-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
                      {section.icon}
                    </div>
                    <span className="font-semibold">{section.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="prose prose-invert prose-sm max-w-none pb-4 pt-2">
                    {section.content.split('\n\n').map((paragraph, i) => {
                      // Check if it's a table
                      if (paragraph.includes('|') && paragraph.includes('---')) {
                        const lines = paragraph.split('\n').filter((l) => l.trim());
                        const headers = lines[0]
                          .split('|')
                          .filter((c) => c.trim())
                          .map((c) => c.trim());
                        const rows = lines.slice(2).map((row) =>
                          row
                            .split('|')
                            .filter((c) => c.trim())
                            .map((c) => c.trim())
                        );

                        return (
                          <div key={i} className="my-2 overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-white/20">
                                  {headers.map((h, j) => (
                                    <th
                                      key={j}
                                      className="px-2 py-1 text-left font-semibold text-primary"
                                    >
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {rows.map((row, j) => (
                                  <tr key={j} className="border-b border-white/10">
                                    {row.map((cell, k) => (
                                      <td key={k} className="px-2 py-1 text-foreground/80">
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      }

                      // Check if it's a list
                      if (paragraph.startsWith('- ')) {
                        return (
                          <ul key={i} className="my-2 space-y-1">
                            {paragraph.split('\n').map((item, j) => (
                              <li
                                key={j}
                                className="flex items-start gap-2 text-sm text-foreground/80"
                              >
                                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                                {item
                                  .replace(/^- /, '')
                                  .split('**')
                                  .map((part, k) =>
                                    k % 2 === 1 ? (
                                      <strong key={k} className="text-primary-glow">
                                        {part}
                                      </strong>
                                    ) : (
                                      part
                                    )
                                  )}
                              </li>
                            ))}
                          </ul>
                        );
                      }

                      // Regular paragraph
                      return (
                        <p key={i} className="my-2 text-sm leading-relaxed text-foreground/90">
                          {paragraph.split('**').map((part, j) =>
                            j % 2 === 1 ? (
                              <strong key={j} className="text-primary-glow">
                                {part}
                              </strong>
                            ) : (
                              part
                            )
                          )}
                        </p>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">{t('help.noResultsFor')} "{searchQuery}"</p>
            <Button
              variant="link"
              onClick={() => setSearchQuery('')}
              className="mt-2 text-primary"
            >
              {t('help.resetSearch')}
            </Button>
          </div>
        )}
      </ScrollArea>

      {/* External rulebook link */}
      <div className="mt-4 border-t border-white/10 pt-4">
        <Button asChild variant="outline" className="w-full border-primary/30">
          <a href="/Deep%20Regrets%20Rulebook_EN.pdf" target="_blank" rel="noreferrer">
            <BookOpen className="mr-2 h-4 w-4" />
            {t('help.openFullRulebook')}
          </a>
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN HELP SYSTEM COMPONENT
// ============================================================================

interface HelpSystemProps {
  defaultTab?: 'tutorial' | 'rulebook';
  onTutorialComplete?: () => void;
}

export const HelpSystem = ({ defaultTab = 'tutorial', onTutorialComplete }: HelpSystemProps) => {
  const { t } = useLanguage();

  return (
    <Tabs defaultValue={defaultTab} className="flex h-full flex-col">
      <TabsList className="grid w-full grid-cols-2 bg-background/50">
        <TabsTrigger
          value="tutorial"
          className="flex items-center gap-2 data-[state=active]:bg-primary/20"
        >
          <GraduationCap className="h-4 w-4" />
          {t('help.tutorial')}
        </TabsTrigger>
        <TabsTrigger
          value="rulebook"
          className="flex items-center gap-2 data-[state=active]:bg-primary/20"
        >
          <BookOpen className="h-4 w-4" />
          {t('help.rulebook')}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="tutorial" className="mt-4 flex-1 overflow-hidden">
        <Tutorial onComplete={onTutorialComplete} />
      </TabsContent>

      <TabsContent value="rulebook" className="mt-4 flex-1 overflow-hidden">
        <Rulebook />
      </TabsContent>
    </Tabs>
  );
};
