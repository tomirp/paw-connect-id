import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Merchant } from "@/data/merchants";

interface Props {
  merchant: Merchant;
}

const MerchantCard = ({ merchant }: Props) => {
  const img = merchant.images[0] ?? "/placeholder.svg";
  return (
    <Link to={`/merchant/${merchant.id}`} aria-label={`Buka ${merchant.name}`}>
      <Card className="transition-all duration-300 hover:shadow-[var(--shadow-elegant)] hover:-translate-y-0.5">
        <CardContent className="p-0">
          <img
            src={img}
            alt={`Foto ${merchant.name}`}
            className="w-full h-40 object-cover rounded-t-md"
            loading="lazy"
          />
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold truncate">{merchant.name}</h3>
              <span className="text-xs">{merchant.rating.toFixed(1)}★</span>
            </div>
            <p className="text-sm text-muted-foreground">{merchant.category} • {merchant.city}</p>
            <div className="flex items-center justify-between mt-2 text-sm">
              <span>{merchant.priceRange}</span>
              <span>{merchant.distanceKm.toFixed(1)} km</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default MerchantCard;
