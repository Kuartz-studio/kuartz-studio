"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ArrowRight } from "lucide-react";
import { ClientDashboard } from "./ClientDashboard";
import Link from "next/link";

type Customer = {
  id: string;
  name: string;
  avatarBase64: string | null;
  email: string;
};

type Props = {
  project: {
    id: string;
    name: string;
    slug: string;
    iconSvg: string | null;
    clientPortalToken: string | null;
    portalSettings: any | null;
    description: string | null;
    logoBase64: string | null;
  };
  customers: Customer[];
  isAdmin: boolean;
  progressStats: {
    total: number;
    done: number;
    percent: number;
  };
};

export function ClientPortalRoot({ project, customers, isAdmin, progressStats }: Props) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      setConfirmed(true);
    } else if (customers.length === 1 && customers[0]) {
      setSelectedCustomer(customers[0]);
      setConfirmed(true);
    }
  }, [customers, isAdmin]);

  if (confirmed) {
    return (
      <ClientDashboard
        project={project}
        currentUser={selectedCustomer || (isAdmin ? { name: "Admin", avatarBase64: null } : null)}
        isAdmin={isAdmin}
      />
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 relative">
      {isAdmin && (
        <Link 
          href={`/projects/${project.slug}`} 
          className="absolute top-4 right-4 md:top-8 md:right-8 bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs px-4 py-2 rounded-full font-semibold tracking-wide border border-primary/20 flex items-center gap-2"
        >
          Retour à l'admin
        </Link>
      )}
      <div className="w-full max-w-3xl flex flex-col gap-12 items-center mt-12 md:mt-0">
        {/* Identification Screen Header */}
        <div className="flex flex-col items-center text-center gap-4">
          {project.logoBase64 ? (
            <div className="w-20 h-20 rounded-2xl overflow-hidden border shadow-sm shrink-0">
              <img src={project.logoBase64} alt={project.name} className="w-full h-full object-cover" />
            </div>
          ) : project.iconSvg ? (
            <div 
              className="w-16 h-16 rounded-2xl border flex items-center justify-center bg-card shadow-sm text-primary [&>svg]:w-8 [&>svg]:h-8 [&>svg]:fill-current"
              dangerouslySetInnerHTML={{ __html: project.iconSvg }}
            />
          ) : null}
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{project.name}</h1>
            {project.description && (
              <p className="text-lg text-muted-foreground mt-2 max-w-lg">{project.description}</p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {progressStats.total > 0 && (
          <div className="w-full max-w-md bg-card border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-muted-foreground font-medium">Progression globale</span>
              <span className="font-bold text-primary">{progressStats.percent}%</span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-1000 ease-out"
                style={{ width: `${progressStats.percent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              {progressStats.done} sur {progressStats.total} tâches terminées
            </p>
          </div>
        )}

        {/* Character Selector */}
        {customers.length === 0 ? (
           <div className="rounded-xl border bg-card p-6 text-center w-full max-w-md">
             <p className="text-muted-foreground">Aucun accès configuré pour ce projet.</p>
           </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-col items-center gap-6 w-full"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight mb-1">Qui êtes-vous ?</h2>
              <p className="text-muted-foreground text-sm">
                Sélectionnez votre profil pour rejoindre l'espace
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-lg">
              {customers.map((customer, index) => {
                const isSelected = selectedCustomer?.id === customer.id;

                return (
                  <motion.button
                    key={customer.id}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: [0.23, 1, 0.32, 1],
                      delay: index * 0.08,
                    }}
                    onClick={() => setSelectedCustomer(customer)}
                    className={`
                      relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 
                      transition-colors duration-200 ease cursor-pointer
                      ${isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-card/50 hover:border-muted-foreground/30 hover:bg-muted/50"
                      }
                    `}
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-muted bg-muted flex items-center justify-center shrink-0">
                      {customer.avatarBase64 ? (
                        <img
                          src={customer.avatarBase64}
                          alt={customer.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-bold text-muted-foreground">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-sm text-center leading-tight">
                      {customer.name}
                    </span>

                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md border-2 border-background"
                        >
                          <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {selectedCustomer && (
                <motion.button
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  onClick={() => setConfirmed(true)}
                  className="flex items-center gap-2 px-8 py-3 mt-4 bg-foreground text-background rounded-full font-semibold text-sm hover:scale-105 transition-transform duration-200 ease-out cursor-pointer shadow-lg"
                >
                  Accéder au portail
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
