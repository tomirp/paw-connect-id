import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Notifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Orders/payment updates
    const ordersChannel = supabase
      .channel("orders-updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const status = (payload.new as any)?.status;
          toast({ title: "Status pesanan berubah", description: `Pesanan ${payload.new.id} kini: ${status}` });
        }
      )
      .subscribe();

    // Chat messages
    const chatChannel = supabase
      .channel("chat-updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `receiver_id=eq.${user.id}` },
        (payload) => {
          const message = (payload.new as any)?.message;
          toast({ title: "Pesan baru", description: message });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(chatChannel);
    };
  }, [user, toast]);

  return null;
};

export default Notifications;
