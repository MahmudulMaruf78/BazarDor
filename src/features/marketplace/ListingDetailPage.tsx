import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useI18n } from "@/app/preferences/LocaleProvider";
import { useAppSelector } from "@/app/store/hooks";
import { selectAuthRole, selectAuthSession } from "@/features/auth/authSlice";
import { ROLE_DASHBOARD_PATH } from "@/constants/roles";
import { dataLayer } from "@/data";
import { ListingProductCard } from "@/features/marketplace/ListingProductCard";
import { ProductCardMarketStats } from "@/features/marketplace/ProductCardMarketStats";
import { snapshotsForListings } from "@/services/productCardMarketSnapshot";
import type {
  Listing,
  Location,
  PriceEntry,
  Product,
  Unit,
} from "@/types/domain/records";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingState } from "@/components/common/LoadingState";
import { PageHeader } from "@/components/common/PageHeader";

export function ListingDetailPage() {
  const { listingId } = useParams<{ listingId: string }>();
  const { t, pickName, formatNumber, translateError, locale, formatUnitLabel } =
    useI18n();
  const session = useAppSelector(selectAuthSession);
  const role = useAppSelector(selectAuthRole);
  const [listing, setListing] = useState<Listing | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [priceEntries, setPriceEntries] = useState<PriceEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!listingId) return;
    void dataLayer.repos.marketplace
      .getListingById(listingId)
      .then(async (result) => {
        if (!result.ok) {
          setError(translateError(result.error.message));
          return;
        }
        setListing(result.data);
        const [products, locs, u, pe] = await Promise.all([
          dataLayer.repos.catalog.listProducts(),
          dataLayer.repos.catalog.listLocations(),
          dataLayer.repos.catalog.listUnits(),
          dataLayer.repos.prices.listPriceEntries(),
        ]);
        if (products.ok)
          setProduct(
            products.data.find((p) => p.id === result.data.productId) ?? null,
          );
        if (locs.ok) setLocations(locs.data);
        if (u.ok) setUnits(u.data);
        if (pe.ok) setPriceEntries(pe.data);
      });
  }, [listingId, translateError]);

  const snapshot = useMemo(() => {
    if (!listing || locations.length === 0 || units.length === 0)
      return undefined;
    return snapshotsForListings([listing], priceEntries, locations, units).get(
      listing.id,
    );
  }, [listing, priceEntries, locations, units]);

  const locationChain =
    snapshot && locale === "bn"
      ? snapshot.locationChainBn
      : snapshot?.locationChainEn;

  const backPath = useMemo(
    () => (role ? ROLE_DASHBOARD_PATH[role] : "/"),
    [role],
  );
  const productTitle = product
    ? pickName(product)
    : (listing?.productId ?? t("loading"));
  const unit = units.find((u) => u.id === listing?.unitId);

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">{error}</p>
        <Link
          to={backPath}
          className={buttonVariants({ variant: "secondary" })}
        >
          {t("backToDashboard")}
        </Link>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <Link
        to={backPath}
        className={buttonVariants({ variant: "ghost", size: "sm" })}
      >
        ← {t("backToDashboard")}
      </Link>
      <PageHeader
        title={productTitle}
        subtitle={t("listingDetailDisclaimer")}
      />
      <ListingProductCard
        title={productTitle}
        imageUrl={product?.imageUrl}
        imageAlt={productTitle}
        contentClassName="space-y-3 text-sm"
      >
        {snapshot && locationChain ? (
          <ProductCardMarketStats
            locationChain={locationChain}
            askingPricePerUnit={snapshot.askingPricePerUnit}
            unitLabel={unit ? formatUnitLabel(unit) : snapshot.unitCode}
            officialAverage={snapshot.officialAverage}
          />
        ) : null}
        <dl className="grid grid-cols-2 gap-3 rounded-md border border-border/80 bg-muted/20 p-3 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">{t("available")}</dt>
            <dd className="font-medium tabular-nums">
              {formatNumber(listing.availableQuantity, 0)}{" "}
              {unit ? formatUnitLabel(unit) : listing.unitId}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{t("reserved")}</dt>
            <dd className="font-medium tabular-nums">
              {formatNumber(listing.reservedQuantity, 0)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{t("sold")}</dt>
            <dd className="font-medium tabular-nums">
              {formatNumber(listing.completedQuantity, 0)}
            </dd>
          </div>
        </dl>
      </ListingProductCard>
      {session?.role === "buyer" ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("offer")}</CardTitle>
            <CardDescription>{t("listingDetailBidHint")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/buyer" className={buttonVariants()}>
              {t("goToBuyerOffers")}
            </Link>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
