import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Mail, Phone, Globe, MessageSquare, Copy, AlertCircle, Loader2, FileText, ChevronDown, Check, Calendar, Clock, ExternalLink, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import useManufacturers from "../hooks/useManufacturers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ContactManufacturerFormProps {
  visible: boolean;
  onClose: () => void;
  projectId?: number | string;
  manufacturer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    website?: string;
  };
  isDarkMode: boolean;
}

// Message templates for quick selection
const MESSAGE_TEMPLATES = [
  {
    title: "General Inquiry",
    content: "Hello [Manufacturer],\n\nI'm interested in working with your company for our upcoming project. Could you please provide more information about your manufacturing capabilities, minimum order quantities, and typical lead times?\n\nThank you,\n[Your Name]"
  },
  {
    title: "Request for Samples",
    content: "Hello [Manufacturer],\n\nI'm considering your company for our upcoming production needs. Before proceeding further, I'd like to request samples of similar products you've manufactured to evaluate quality.\n\nPlease let me know the process for obtaining samples and any associated costs.\n\nThank you,\n[Your Name]"
  },
  {
    title: "Pricing Inquiry",
    content: "Hello [Manufacturer],\n\nI'm looking for a manufacturing partner for our product and would like to get pricing information. Our initial order would be approximately [volume] units, with potential for recurring orders.\n\nCould you provide a quote and information about your pricing structure?\n\nThank you,\n[Your Name]"
  }
];

  // Animation variants for tab content
const tabContentVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

// Animation variants for contact items
const contactItemVariants = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({ 
    opacity: 1, 
    transition: { 
      delay: 0.1 * i, 
      duration: 0.3,
    } 
  }),
  hover: { 
    scale: 1.01, 
    transition: { duration: 0.2 }
  }
};

// Safer animation variants for common elements
const safeAnimationVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
};

const ContactManufacturerForm: React.FC<ContactManufacturerFormProps> = ({
  visible,
  onClose,
  projectId,
  manufacturer,
  isDarkMode,
}) => {
  // State management
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("message");
  const [formError, setFormError] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [isContactTabMounted, setIsContactTabMounted] = useState(false);
  const { toast } = useToast();
  const { contactManufacturer } = useManufacturers(projectId);

  // Update word count when message changes
  useEffect(() => {
    const words = message.trim() ? message.trim().split(/\s+/).length : 0;
    setWordCount(words);
  }, [message]);

  // Reset form error when message changes
  useEffect(() => {
    if (formError && message.trim()) {
      setFormError(null);
    }
  }, [message, formError]);

  // Reset copy success state after 2 seconds
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => {
        setCopySuccess(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!visible) {
      // Reset form with a delay to allow animation to complete
      const timer = setTimeout(() => {
        setMessage("");
        setFormError(null);
        setActiveTab("message");
        setIsTemplateMenuOpen(false);
        setCopySuccess(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  // Handle tab mounting
  useEffect(() => {
    if (activeTab === "contact") {
      setIsContactTabMounted(true);
    } else {
      // Delay unmounting to allow animation to finish
      const timer = setTimeout(() => {
        setIsContactTabMounted(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // Apply message template
  const applyTemplate = (templateContent: string) => {
    // Replace placeholder with actual manufacturer name
    let customizedTemplate = templateContent.replace('[Manufacturer]', manufacturer.name);
    setMessage(customizedTemplate);
    setIsTemplateMenuOpen(false);
    
    // Focus the textarea after applying template
    setTimeout(() => {
      const textarea = document.getElementById('message') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
        // Position cursor at the [Your Name] placeholder if it exists
        const namePos = customizedTemplate.indexOf('[Your Name]');
        if (namePos >= 0) {
          textarea.setSelectionRange(namePos, namePos + 10);
        }
      }
    }, 100);
  };

  // Memoize clipboard function to prevent unnecessary re-renders
  const copyToClipboard = useCallback((text: string, description: string, id: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copied to clipboard",
          description: description,
        });
        setCopySuccess(id);
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          title: "Failed to copy",
          description: "Please try again or copy manually",
          variant: "destructive",
        });
      }
    );
  }, [toast]);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!message.trim()) {
      setFormError("Please enter a message to the manufacturer");
      toast({
        title: "Message Required",
        description: "Please enter a message to the manufacturer",
        variant: "destructive",
      });
      return;
    }
    
    setIsSending(true);
    setFormError(null);
    
    try {
      console.log(`Sending message to ${manufacturer.name} (ID: ${manufacturer.id})`);
      await contactManufacturer(manufacturer.id, message);
      
      toast({
        title: "Message Sent",
        description: `Your message has been sent to ${manufacturer.name}`,
      });
      
      // Clear form and close
      setMessage("");
      onClose();
    } catch (error) {
      console.error("Error sending message:", error);
      setFormError("Failed to send message. Please try again.");
      toast({
        title: "Failed to send message",
        description: "There was an error contacting the manufacturer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Handle tab change with smooth transitions
  const handleTabChange = (value: string) => {
    try {
      setActiveTab(value);
    } catch (error) {
      console.error("Error switching tabs:", error);
      toast({
        title: "Something went wrong",
        description: "Failed to switch tabs. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Early return if not visible
  if (!visible) return null;

  // Render message tab content
  const renderMessageTab = () => (
    <TabsContent value="message" className="outline-none">
      <form onSubmit={handleSubmit} className="animate-in fade-in duration-300">
                  <div className="space-y-4">
          <div className="flex justify-between items-center">
                      <label
                        htmlFor="message"
              className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Your Message
                      </label>
            
            <DropdownMenu open={isTemplateMenuOpen} onOpenChange={setIsTemplateMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`text-xs gap-1 h-8 ${isDarkMode ? "bg-slate-700 hover:bg-slate-600 border-slate-600" : ""}`}
                >
                  <FileText size={14} />
                  Templates
                  <ChevronDown size={14} className={`transition-transform ${isTemplateMenuOpen ? "rotate-180" : ""}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}>
                {MESSAGE_TEMPLATES.map((template, index) => (
                  <DropdownMenuItem 
                    key={index}
                    onClick={() => applyTemplate(template.content)}
                    className={isDarkMode ? "hover:bg-slate-700 focus:bg-slate-700" : ""}
                  >
                    {template.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="relative">
                      <Textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={`Introduce yourself and your project to ${manufacturer?.name}...`}
              className={`transition-all ${
                isDarkMode 
                  ? "bg-slate-700 border-slate-600 text-white focus:border-blue-500" 
                  : "focus:border-blue-400"
              } ${formError ? "border-red-500" : ""}`}
              rows={6}
                        required
                      />
            
            <div className={`absolute bottom-2 right-2 text-xs ${
              isDarkMode ? "text-slate-400" : "text-slate-500"
            }`}>
              {wordCount} words
            </div>
            
            {formError && (
              <div className="mt-2 flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle size={14} />
                <span>{formError}</span>
              </div>
            )}
                    </div>
                    
          <div className={`text-sm p-3 rounded-md ${
            isDarkMode ? "bg-slate-700/50 text-gray-300" : "bg-blue-50 text-gray-600"
          }`}>
            <p className="font-medium mb-1">Tips for a good introduction:</p>
            <ul className="list-disc pl-5 space-y-1">
                        <li>Briefly explain your brand and values</li>
                        <li>Mention your timeline and volume expectations</li>
                        <li>Ask specific questions about their capabilities</li>
                        <li>Request samples or portfolio examples if needed</li>
                      </ul>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={onClose}
                        type="button"
              className={isDarkMode ? "hover:bg-slate-700" : ""}
              disabled={isSending}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isSending}
                        className="gap-2"
                      >
              {isSending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending...
                </>
              ) : (
                          <>
                            Send Message <Send size={16} />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </TabsContent>
  );

  // Render contact tab content with error handling
  const renderContactTab = () => (
    <TabsContent value="contact" className="outline-none">
      <div className="space-y-5 animate-in fade-in duration-300">
        {(() => {
          try {
            if (manufacturer.email || manufacturer.phone || manufacturer.website) {
              return (
                <>
                  <motion.div 
                    variants={safeAnimationVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex items-center gap-2"
                  >
                    <Share2 size={16} className={isDarkMode ? "text-blue-400" : "text-blue-600"} />
                    <h3 className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                      Contact details for {manufacturer.name}
                    </h3>
                  </motion.div>
                  
                  <div className={`p-4 rounded-lg border ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
                    {manufacturer.email && (
                      <motion.div 
                        custom={1}
                        variants={contactItemVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        className={`p-4 rounded-lg mb-3 ${isDarkMode ? "bg-slate-700/70" : "bg-slate-50"} 
                          flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 transition-colors duration-200
                          border ${isDarkMode ? "border-transparent hover:border-blue-600/30" : "border-transparent hover:border-blue-200"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${isDarkMode ? "bg-blue-900/40" : "bg-blue-100"}`}>
                            <Mail size={20} className={isDarkMode ? "text-blue-300" : "text-blue-600"} />
                          </div>
                          <div>
                            <h3 className={`text-sm font-medium ${isDarkMode ? "text-slate-200" : "text-slate-900"} flex items-center gap-2`}>
                              Email
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${isDarkMode ? "bg-blue-900/50 text-blue-300" : "bg-blue-100 text-blue-700"}`}>
                                Preferred
                              </span>
                            </h3>
                            <p className={`text-sm ${isDarkMode ? "text-slate-300" : "text-slate-700"} truncate max-w-[200px]`}>
                              {manufacturer.email}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-9 sm:ml-0">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => window.location.href = `mailto:${manufacturer.email}`}
                                  className={`${isDarkMode ? "bg-slate-700 hover:bg-slate-600 border-slate-600" : ""} gap-1`}
                                >
                                  <Mail size={14} />
                                  Email
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>Open email client</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => copyToClipboard(manufacturer.email || "", "Email copied to clipboard", "email")}
                                  className={`${isDarkMode ? "text-slate-300 hover:text-white hover:bg-slate-600" : "text-slate-700 hover:bg-slate-200"} relative transition-colors`}
                                >
                                  {copySuccess === "email" ? (
                                    <motion.div 
                                      initial={{ scale: 0.5, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      className="absolute inset-0 flex items-center justify-center"
                                    >
                                      <Check size={16} className="text-green-500" />
                                    </motion.div>
                                  ) : (
                                    <Copy size={16} />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>{copySuccess === "email" ? "Copied!" : "Copy email"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </motion.div>
                    )}
                    
                    {manufacturer.phone && (
                      <motion.div 
                        custom={2}
                        variants={contactItemVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        className={`p-4 rounded-lg mb-3 ${isDarkMode ? "bg-slate-700/70" : "bg-slate-50"} 
                          flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 transition-colors duration-200
                          border ${isDarkMode ? "border-transparent hover:border-green-600/30" : "border-transparent hover:border-green-200"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${isDarkMode ? "bg-green-900/40" : "bg-green-100"}`}>
                            <Phone size={20} className={isDarkMode ? "text-green-300" : "text-green-600"} />
                          </div>
                          <div>
                            <h3 className={`text-sm font-medium ${isDarkMode ? "text-slate-200" : "text-slate-900"}`}>Phone</h3>
                            <div className="flex items-center gap-1">
                              <p className={`text-sm ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                                {manufacturer.phone}
                              </p>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${isDarkMode ? "bg-green-900/30 text-green-300" : "bg-green-100/80 text-green-700"}`}>
                                Business hours
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-9 sm:ml-0">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => window.location.href = `tel:${manufacturer.phone}`}
                                  className={`${isDarkMode ? "bg-slate-700 hover:bg-slate-600 border-slate-600" : ""} gap-1`}
                                >
                                  <Phone size={14} />
                                  Call
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>Call this number</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => copyToClipboard(manufacturer.phone || "", "Phone number copied to clipboard", "phone")}
                                  className={`${isDarkMode ? "text-slate-300 hover:text-white hover:bg-slate-600" : "text-slate-700 hover:bg-slate-200"} relative transition-colors`}
                                >
                                  {copySuccess === "phone" ? (
                                    <motion.div 
                                      initial={{ scale: 0.5, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      className="absolute inset-0 flex items-center justify-center"
                                    >
                                      <Check size={16} className="text-green-500" />
                                    </motion.div>
                                  ) : (
                                    <Copy size={16} />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>{copySuccess === "phone" ? "Copied!" : "Copy phone number"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </motion.div>
                    )}
                    
                    {manufacturer.website && (
                      <motion.div 
                        custom={3}
                        variants={contactItemVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        className={`p-4 rounded-lg ${isDarkMode ? "bg-slate-700/70" : "bg-slate-50"} 
                          flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 transition-colors duration-200
                          border ${isDarkMode ? "border-transparent hover:border-purple-600/30" : "border-transparent hover:border-purple-200"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${isDarkMode ? "bg-purple-900/40" : "bg-purple-100"}`}>
                            <Globe size={20} className={isDarkMode ? "text-purple-300" : "text-purple-600"} />
                          </div>
                          <div>
                            <h3 className={`text-sm font-medium ${isDarkMode ? "text-slate-200" : "text-slate-900"}`}>Website</h3>
                            <div className="flex items-center gap-1 flex-wrap">
                              <p className={`text-sm ${isDarkMode ? "text-slate-300" : "text-slate-700"} truncate max-w-[180px] sm:max-w-[220px]`}>
                                {manufacturer.website.replace(/^https?:\/\//i, '')}
                              </p>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${isDarkMode ? "bg-purple-900/30 text-purple-300" : "bg-purple-100/80 text-purple-700"}`}>
                                Official
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-9 sm:ml-0">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => window.open(manufacturer.website.startsWith('http') ? manufacturer.website : `https://${manufacturer.website}`, '_blank')}
                                  className={`${isDarkMode ? "bg-slate-700 hover:bg-slate-600 border-slate-600" : ""} gap-1`}
                                >
                                  <ExternalLink size={14} />
                                  Visit
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>Opens in new tab</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => copyToClipboard(manufacturer.website || "", "Website URL copied to clipboard", "website")}
                                  className={`${isDarkMode ? "text-slate-300 hover:text-white hover:bg-slate-600" : "text-slate-700 hover:bg-slate-200"} relative transition-colors`}
                                >
                                  {copySuccess === "website" ? (
                                    <motion.div 
                                      initial={{ scale: 0.5, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      className="absolute inset-0 flex items-center justify-center"
                                    >
                                      <Check size={16} className="text-green-500" />
                                    </motion.div>
                                  ) : (
                                    <Copy size={16} />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>{copySuccess === "website" ? "Copied!" : "Copy website URL"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  
                  <motion.div 
                    variants={safeAnimationVariants}
                    initial="hidden"
                    animate="visible"
                    className={`mt-4 flex gap-2 ${isDarkMode ? "text-amber-400" : "text-amber-600"}`}
                  >
                    <Clock size={16} />
                    <p className="text-xs">Response times may vary. Consider sending a message for more reliable communication.</p>
                  </motion.div>
                  
                  <motion.div 
                    variants={safeAnimationVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    className={`mt-4 p-5 rounded-lg flex items-center gap-3 cursor-pointer shadow-sm
                      ${isDarkMode ? 
                        "bg-gradient-to-r from-blue-900/30 to-blue-800/20 hover:from-blue-900/40 hover:to-blue-800/30 border border-blue-800/30" : 
                        "bg-gradient-to-r from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-50 border border-blue-100"}`}
                    onClick={() => setActiveTab("message")}
                    role="button"
                    aria-label="Switch to message tab"
                  >
                    <div className={`p-2 rounded-full ${isDarkMode ? "bg-blue-900/40" : "bg-blue-100"}`}>
                      <MessageSquare size={20} className={isDarkMode ? "text-blue-300" : "text-blue-600"} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-sm font-medium ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>
                        Prefer to send a message?
                      </h3>
                      <p className={`text-xs mt-1 ${isDarkMode ? "text-blue-400/70" : "text-blue-600/70"}`}>
                        Click here to compose a detailed message about your project needs
                      </p>
                    </div>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, repeatDelay: 2, duration: 1 }}
                    >
                      <ChevronDown size={20} className={`transition-transform rotate-270 ${isDarkMode ? "text-blue-300" : "text-blue-500"}`} />
                    </motion.div>
                  </motion.div>
                </>
              );
            } else {
              return (
                <motion.div 
                  variants={safeAnimationVariants}
                  initial="hidden"
                  animate="visible"
                  className={`p-6 rounded-lg ${isDarkMode ? 
                    "bg-gradient-to-b from-slate-700/80 to-slate-800/50 border border-slate-600" : 
                    "bg-gradient-to-b from-slate-50 to-white border border-slate-200"} text-center`}
                >
                  <div className="flex flex-col items-center justify-center gap-4">
                    <motion.div 
                      initial={{ scale: 0.8 }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 3 }}
                      className={`p-4 rounded-full ${isDarkMode ? "bg-amber-900/30" : "bg-amber-100"}`}
                    >
                      <AlertCircle size={28} className={isDarkMode ? "text-amber-300" : "text-amber-600"} />
                    </motion.div>
                    <div className="space-y-3">
                      <h3 className={`font-medium text-lg ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>
                        No contact information available
                      </h3>
                      <p className={`text-sm ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                        {manufacturer.name} hasn't provided their contact details yet. 
                        You can still reach out through our messaging system.
                      </p>
                      <div className="pt-2">
                        <Button
                          variant="default"
                          size="lg"
                          className={`mt-2 w-full ${isDarkMode ? "bg-blue-600 hover:bg-blue-700" : ""} shadow-sm`}
                          onClick={() => setActiveTab("message")}
                        >
                          <MessageSquare size={18} className="mr-2" />
                          Send a direct message
                        </Button>
                        <p className={`text-xs mt-3 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                          Messages are typically responded to within 24-48 business hours
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            }
          } catch (error) {
            console.error("Error rendering contact tab:", error);
            return (
              <div className="p-6 text-center">
                <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
                <h3 className="mb-2 text-lg font-medium">Something went wrong</h3>
                <p className="text-sm mb-4">Unable to load contact information</p>
                <Button onClick={() => setActiveTab("message")}>
                  Go back to messaging
                </Button>
              </div>
            );
          }
        })()}

        <motion.div 
          variants={safeAnimationVariants}
          initial="hidden"
          animate="visible"
          className={`mt-6 p-5 rounded-lg ${isDarkMode ? 
            "bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600" : 
            "bg-gradient-to-br from-slate-50 to-white border border-slate-200"} shadow-sm`}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className={`text-sm font-semibold flex items-center gap-2 ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>
              <Calendar size={16} className={isDarkMode ? "text-blue-300" : "text-blue-600"} /> 
              Communication Best Practices
            </h4>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${isDarkMode ? 
              "bg-blue-900/40 text-blue-300 border border-blue-800/50" : 
              "bg-blue-100 text-blue-700"}`}>
              Pro Tips
            </span>
          </div>
          
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
            <div className={`p-3 rounded-md ${isDarkMode ? "bg-slate-800/70" : "bg-white"} border ${isDarkMode ? "border-slate-700" : "border-slate-100"}`}>
              <p className="text-xs font-medium mb-1.5 flex items-center gap-1.5">
                <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full ${isDarkMode ? "bg-blue-900/60 text-blue-300" : "bg-blue-100 text-blue-700"}`}>1</span>
                Project Specifics
              </p>
              <p className="text-xs leading-relaxed">
                Clearly explain your timeframe, volume requirements, and product specifications to get the most relevant information.
              </p>
            </div>
            
            <div className={`p-3 rounded-md ${isDarkMode ? "bg-slate-800/70" : "bg-white"} border ${isDarkMode ? "border-slate-700" : "border-slate-100"}`}>
              <p className="text-xs font-medium mb-1.5 flex items-center gap-1.5">
                <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full ${isDarkMode ? "bg-green-900/60 text-green-300" : "bg-green-100 text-green-700"}`}>2</span>
                Ask About Capabilities
              </p>
              <p className="text-xs leading-relaxed">
                Request information about machinery, capacity, specializations, and certifications that match your product needs.
              </p>
            </div>
            
            <div className={`p-3 rounded-md ${isDarkMode ? "bg-slate-800/70" : "bg-white"} border ${isDarkMode ? "border-slate-700" : "border-slate-100"}`}>
              <p className="text-xs font-medium mb-1.5 flex items-center gap-1.5">
                <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full ${isDarkMode ? "bg-purple-900/60 text-purple-300" : "bg-purple-100 text-purple-700"}`}>3</span>
                Ordering Terms
              </p>
              <p className="text-xs leading-relaxed">
                Inquire about MOQ (minimum order quantity), payment terms, and lead times to better plan your production schedule.
              </p>
            </div>
            
            <div className={`p-3 rounded-md ${isDarkMode ? "bg-slate-800/70" : "bg-white"} border ${isDarkMode ? "border-slate-700" : "border-slate-100"}`}>
              <p className="text-xs font-medium mb-1.5 flex items-center gap-1.5">
                <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full ${isDarkMode ? "bg-amber-900/60 text-amber-300" : "bg-amber-100 text-amber-700"}`}>4</span>
                Quality Assurance
              </p>
              <p className="text-xs leading-relaxed">
                Request samples, ask about quality control processes, and review previous work to ensure manufacturing quality.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </TabsContent>
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`w-full max-w-lg rounded-xl p-6 ${
              isDarkMode ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-100"
            } shadow-xl`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <motion.h2 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"} flex items-center gap-2`}
              >
                <div className={`p-1 rounded-full ${
                  isDarkMode ? "bg-blue-900/40" : "bg-blue-100"
                }`}>
                  {activeTab === "message" ? 
                    <MessageSquare size={18} className={isDarkMode ? "text-blue-300" : "text-blue-600"} /> : 
                    <Phone size={18} className={isDarkMode ? "text-blue-300" : "text-blue-600"} />
                  }
                </div>
                Contact {manufacturer?.name}
              </motion.h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className={isDarkMode ? "text-gray-300 hover:text-white hover:bg-slate-700" : "text-gray-500 hover:text-black hover:bg-slate-100"}
              >
                <X size={20} />
              </Button>
            </div>
            
            <Tabs 
              value={activeTab} 
              onValueChange={handleTabChange} 
              defaultValue="message" 
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="message" className="flex items-center gap-2">
                  <MessageSquare size={16} />
                  <span>Send Message</span>
                </TabsTrigger>
                <TabsTrigger value="contact" className="flex items-center gap-2">
                  <Phone size={16} />
                  <span>Contact Info</span>
                </TabsTrigger>
              </TabsList>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={tabContentVariants}
                >
                  {activeTab === "message" ? renderMessageTab() : renderContactTab()}
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContactManufacturerForm;
