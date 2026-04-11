"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ArrowRight } from "lucide-react";

type Customer = {
  id: string;
  name: string;
  avatarBase64: string | null;
  email: string;
};

type Props = {
  customers: Customer[];
  isAdmin: boolean;
  projectName: string;
};

export function CharacterSelector({ customers, isAdmin, projectName }: Props) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  // Auto-select if only 1 customer or if admin
  useEffect(() => {
    if (isAdmin) {
      setConfirmed(true);
    } else if (customers.length === 1 && customers[0]) {
      setSelectedCustomer(customers[0]);
      setConfirmed(true);
    }
  }, [customers, isAdmin]);

  // If confirmed, show the dashboard placeholder
  if (confirmed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        className="rounded-xl border bg-card p-8 text-center"
      >
        <div className="text-2xl font-semibold mb-2">
          {isAdmin ? "👁️ Mode Admin" : `Bienvenue, ${selectedCustomer?.name}`}
        </div>
        <p className="text-muted-foreground">
          Dashboard du projet <strong>{projectName}</strong> — à venir.
        </p>
      </motion.div>
    );
  }

  // No customers linked
  if (customers.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-muted-foreground">
          Aucun accès client configuré pour ce projet.
        </p>
      </div>
    );
  }

  // Multiple customers — "Choose Your Character" screen
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="flex flex-col items-center gap-8"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight mb-1">Qui êtes-vous ?</h2>
        <p className="text-muted-foreground text-sm">
          Sélectionnez votre profil pour accéder au portail
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-md">
        {customers.map((customer, index) => {
          const isSelected = selectedCustomer?.id === customer.id;

          return (
            <motion.button
              key={customer.id}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.25,
                ease: [0.23, 1, 0.32, 1],
                delay: index * 0.06,
              }}
              onClick={() => setSelectedCustomer(customer)}
              className={`
                relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 
                transition-colors duration-150 ease cursor-pointer
                ${isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/30"
                }
              `}
            >
              {/* Avatar */}
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

              {/* Name */}
              <span className="font-medium text-sm text-center leading-tight">
                {customer.name}
              </span>

              {/* Check icon */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Confirm Button */}
      <AnimatePresence>
        {selectedCustomer && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            onClick={() => setConfirmed(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors duration-150 ease cursor-pointer shadow-sm"
          >
            Continuer en tant que {selectedCustomer.name}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
