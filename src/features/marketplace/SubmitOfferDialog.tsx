import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { submitBid } from '@/features/marketplace/marketplaceService'
import type { Listing } from '@/types/domain/records'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type SubmitOfferDialogProps = {
  open: boolean
  listing: Listing | null
  buyerUserId: string
  onOpenChange: (open: boolean) => void
  onSubmitted?: () => void
}

export function SubmitOfferDialog({
  open,
  listing,
  buyerUserId,
  onOpenChange,
  onSubmitted,
}: SubmitOfferDialogProps) {
  const { t, translateError } = useI18n()
  const [offerQty, setOfferQty] = useState('10')
  const [offerPrice, setOfferPrice] = useState('35')

  useEffect(() => {
    if (listing) {
      setOfferPrice(String(listing.askingPricePerUnit))
      setOfferQty(String(Math.min(10, Math.max(1, listing.availableQuantity))))
    }
  }, [listing])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('submitBidTitle')}</DialogTitle>
        </DialogHeader>
        {listing ? (
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault()
              void submitBid({
                buyerUserId,
                listingId: listing.id,
                quantity: Number(offerQty),
                offeredPricePerUnit: Number(offerPrice),
              }).then((result) => {
                if (!result.ok) {
                  toast.error(translateError(result.error.message))
                  return
                }
                toast.success(t('offerSubmitted'))
                onOpenChange(false)
                onSubmitted?.()
              })
            }}
          >
            <div className="space-y-1">
              <Label>{t('quantity')}</Label>
              <Input value={offerQty} onChange={(e) => setOfferQty(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{t('offerPriceUnit')}</Label>
              <Input value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">
              {t('sendOffer')}
            </Button>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
