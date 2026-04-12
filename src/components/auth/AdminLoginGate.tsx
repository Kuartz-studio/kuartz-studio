"use client";

import { useState, useCallback, useRef, useEffect, type ReactNode, startTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import LottiePackage from "lottie-react";
import logoAnimation from "@/assets/logo-otp-kuartz.json";
import { ArrowLeft } from "lucide-react";
import { AuthState } from "@/actions/auth";

const Lottie = (typeof LottiePackage === "object" && (LottiePackage as any).default) ? (LottiePackage as any).default : LottiePackage;

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

type Step = "profiles" | "selected";

export type AdminProfile = {
  id: string;
  name: string;
  email: string;
};

// Hardcoded logic pour mapper les prénoms aux vidéos extraites de Kuartz-App
function getVideoForName(name: string) {
  const n = name.toLowerCase();
  if (n.includes("andrea") || n.includes("andréa")) return "/avatars/andrea-video-avatar.mp4";
  if (n.includes("anas")) return "/avatars/anas-video-avatar.mp4";
  if (n.includes("mehdi")) return "/avatars/mehdi-video-avatar.mp4";
  return null;
}
function getImageForName(name: string) {
  const n = name.toLowerCase();
  if (n.includes("andrea") || n.includes("andréa")) return "/avatars/andrea.png";
  if (n.includes("anas")) return "/avatars/anas.png";
  if (n.includes("mehdi")) return "/avatars/mehdi.png";
  return null;
}

function ProfileVideo({ profile, className = "" }: { profile: AdminProfile; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const videoSrc = getVideoForName(profile.name);
  const imgSrc = getImageForName(profile.name);

  return (
    <div className={`w-full h-full ${className}`}>
      {videoSrc && !videoError ? (
        <video 
          ref={videoRef}
          src={videoSrc} 
          onError={() => setVideoError(true)}
          autoPlay 
          preload="auto"
          loop 
          muted 
          playsInline 
          style={{ transform: "scale(1.5)", transformOrigin: "50% 0%" }}
          className="w-full h-full object-cover pointer-events-none" 
        />
      ) : imgSrc ? (
        <img 
          src={imgSrc} 
          alt={profile.name} 
          style={{ transform: "scale(1.5)", transformOrigin: "50% 0%" }}
          className="w-full h-full object-cover pointer-events-none" 
        />
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center font-bold text-2xl">
          {profile.name.charAt(0)}
        </div>
      )}
    </div>
  );
}

export function AdminLoginGate({ 
  admins, 
  formAction, 
  formState, 
  isPending 
}: { 
  admins: AdminProfile[], 
  formAction: (payload: FormData) => void,
  formState: AuthState,
  isPending: boolean
}) {
  const [step, setStep] = useState<Step>("profiles");
  const [selectedProfile, setSelectedProfile] = useState<AdminProfile | null>(null);
  const [code, setCode] = useState("");

  const handleCodeChange = useCallback(
    async (value: string) => {
      setCode(value);
      if (value.length === 6 && selectedProfile) {
        const formData = new FormData();
        formData.append("email", selectedProfile.email);
        formData.append("pin", value);
        
        startTransition(() => {
          formAction(formData);
        });
      }
    },
    [formAction, selectedProfile]
  );

  // Handle action result: redirect on success, toast on error
  useEffect(() => {
    if (formState.success && formState.redirectTo) {
      window.location.href = formState.redirectTo;
    } else if (formState.error) {
      toast.error(formState.error);
      setCode("");
    }
  }, [formState]);

  return (
    <div className="dark fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground">
      
      {/* Fixed Lottie - No exit/enter animation */}
      <div className="w-56 h-56 flex items-center justify-center mb-8">
        <Lottie animationData={logoAnimation} loop={true} />
      </div>

      <div className="relative w-full max-w-xl flex justify-center">
        <AnimatePresence>
          {step === "profiles" ? (
            <motion.div
              key="profiles"
              className="flex flex-col items-center gap-8 px-6 text-center w-full absolute top-0"
            >
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <p className="text-muted-foreground text-sm font-medium">Accès restreint</p>
              </motion.div>
              
              <div className="flex items-center justify-center gap-6 mt-4">
                {admins.map(profile => (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: selectedProfile?.id === profile.id ? 1 : 0 }}
                  >
                    <button
                      onClick={() => {
                        setSelectedProfile(profile);
                        setCode("");
                        setStep("selected");
                      }}
                      className="flex flex-col items-center gap-3 transition-transform hover:scale-105 group"
                    >
                      <motion.div 
                        layoutId={`avatar-${profile.id}`}
                        className="w-20 h-20 rounded-full overflow-hidden border border-[var(--color-border)] group-hover:border-[var(--color-primary)] transition-colors ring-2 ring-transparent group-hover:ring-[var(--color-primary)]/20 shadow-sm"
                      >
                        <ProfileVideo profile={profile} />
                      </motion.div>
                      <motion.span 
                        exit={{ opacity: 0 }}
                        className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors"
                      >
                        {profile.name}
                      </motion.span>
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : step === "selected" && selectedProfile ? (
            <motion.div
              key="selected"
              className="flex flex-col items-center gap-12 px-6 w-full absolute top-0"
            >
              <div className="flex items-center gap-8 mt-4">
                <motion.div 
                  layoutId={`avatar-${selectedProfile.id}`}
                  className="w-24 h-24 rounded-full overflow-hidden border border-[var(--color-border)] shadow-sm shrink-0 z-10"
                >
                  <ProfileVideo profile={selectedProfile} />
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0 } }}
                  transition={{ delay: 0.1, ...spring }}
                  className="flex flex-col gap-3 items-start"
                >
                  <div className="flex flex-col items-start">
                    <button 
                      onClick={() => {
                        setStep("profiles");
                        setSelectedProfile(null);
                        setCode("");
                      }}
                      className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-2 -ml-1 p-1 rounded-md"
                      aria-label="Retour"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-semibold text-foreground tracking-tight">Bonjour {selectedProfile.name}</h2>
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: "auto" }} 
                    className="flex flex-col items-start gap-3 mt-2"
                  >
                    <p className="text-xs text-muted-foreground">Entrez votre code d'accès</p>
                    <InputOTP
                      maxLength={6} // Changé de 4 à 6
                      value={code}
                      onChange={handleCodeChange}
                      disabled={isPending}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="w-10 h-10 text-lg border-border" />
                        <InputOTPSlot index={1} className="w-10 h-10 text-lg border-border" />
                        <InputOTPSlot index={2} className="w-10 h-10 text-lg border-border" />
                        <InputOTPSlot index={3} className="w-10 h-10 text-lg border-border" />
                        <InputOTPSlot index={4} className="w-10 h-10 text-lg border-border" />
                        <InputOTPSlot index={5} className="w-10 h-10 text-lg border-border" />
                      </InputOTPGroup>
                    </InputOTP>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
