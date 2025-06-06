import { Button } from "./button";
import { Textarea } from "./textarea";
import { Card, CardContent } from "./card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./dialog";
import { Progress } from "./progress";
import AnimatedTitle from "./animated-title";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useTranslation } from 'react-i18next';

const AIProductGenerator = () => {
  const { t } = useTranslation();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  // Gọi API BE (chuẩn bị cho backend)
  const callAIGenerator = async (desc: string) => {
    try {
      setError("");
      setResult("");
      const res = await fetch("/api/ai-product-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: desc })
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      if (data.result) {
        setResult(data.result);
      } else {
        setResult("No result returned from AI.");
      }
    } catch (e: any) {
      setError(e.message || "Unknown error");
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setResult("");
    // Demo: gọi API thật, nếu BE chưa có thì giả lập
    try {
      await callAIGenerator(description);
    } catch {
      setResult(
        `✨ AI Suggestion for: "${description}"\n\n- Product 1: ...\n- Product 2: ...\n- Product 3: ...`
      );
    }
    setLoading(false);
    setShowResult(true);
  };

  return (
    <section className="w-full flex flex-col items-center justify-center py-16 relative overflow-visible">
      {/* Animated background gradient + glow */}
      <motion.div
        className="absolute inset-0 -z-10 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ filter: "blur(80px)" }}
      >
        <motion.div
          className="absolute left-1/2 top-0 w-[600px] h-[300px] bg-gradient-to-br from-primary/40 via-accent/30 to-transparent rounded-full shadow-2xl"
          animate={{ y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ x: "-50%" }}
        />
        <motion.div
          className="absolute right-10 bottom-0 w-[300px] h-[200px] bg-gradient-to-tr from-accent/40 via-primary/30 to-transparent rounded-full shadow-xl"
          animate={{ y: [0, -20, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        viewport={{ once: true }}
        className="w-full flex flex-col items-center"
      >
        {/* Tiêu đề động, icon AI, hiệu ứng glow */}
        <motion.div
          className="relative flex flex-col items-center mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <motion.div
            className="absolute -top-8 left-1/2 -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-primary/40 via-accent/30 to-transparent rounded-full blur-2xl opacity-60 animate-pulse"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="mb-2 flex items-center gap-2"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Sparkles className="w-10 h-10 text-primary drop-shadow-lg animate-spin-slow" />
            <span className="text-3xl font-extrabold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent drop-shadow-lg select-none">
              {t('ai-product-generator.title')}
            </span>
          </motion.div>
          <AnimatedTitle
            title={t('ai-product-generator.animated-title') || ''}
            subtitle={t('ai-product-generator.animated-subtitle') || ''}
            size="lg"
            variant="gradient"
          />
        </motion.div>
        <Card className="w-full max-w-4xl mt-8 shadow-2xl border-2 border-primary/30 bg-background/90 backdrop-blur-lg relative transition-all duration-300 hover:shadow-[0_8px_40px_0_rgba(80,80,255,0.15)] hover:scale-[1.015]">
          <CardContent className="flex flex-col items-center gap-8 p-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <Textarea
                className="w-full min-h-[120px] mb-4 resize-none text-base bg-background/80 border-primary/30 focus-visible:ring-primary"
                placeholder={t('ai-product-generator.textarea-placeholder')}
                value={description}
                onChange={e => setDescription(e.target.value)}
                disabled={loading}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-full flex flex-col items-center"
            >
              <Button
                className="w-full md:w-auto bg-gradient-to-r from-primary via-accent to-primary text-base font-semibold py-3 px-8 flex items-center justify-center gap-2 shadow-lg hover:scale-105 hover:shadow-[0_4px_24px_0_rgba(80,80,255,0.18)] transition-transform duration-200"
                onClick={handleGenerate}
                disabled={!description.trim() || loading}
              >
                <span className="mr-2 animate-pulse">✨</span> {t('ai-product-generator.generate-button')}
              </Button>
              <AnimatePresence>
                {loading && (
                  <motion.div
                    className="w-full mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Progress value={70} />
                    <div className="text-center text-muted-foreground mt-2 animate-pulse">
                      {t('ai-product-generator.loading')}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </CardContent>
        </Card>
        {/* Popup Dialog for result hoặc lỗi */}
        <Dialog open={showResult || !!error} onOpenChange={v => { setShowResult(v); setError(""); }}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{error ? t('ai-product-generator.error-title') : t('ai-product-generator.result-title')}</DialogTitle>
              <DialogDescription>
                {error ? t('ai-product-generator.error-desc') : t('ai-product-generator.result-desc')}
              </DialogDescription>
            </DialogHeader>
            <div className="whitespace-pre-line text-base text-foreground/90 mt-4">
              {error ? error : result}
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </section>
  );
};

export default AIProductGenerator; 