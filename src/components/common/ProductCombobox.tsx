'use client'

import { useCallback, useId, useMemo, useRef, useState } from 'react'
import { useI18n } from '@/app/preferences/LocaleProvider'
import {
  filterProductsByQuery,
  productDisplayName,
  resolveProductId,
  type ProductComboboxOption,
} from '@/components/common/productComboboxResolve'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent } from '@/components/ui/popover'
import { cn } from 'cn'
import { ChevronDownIcon } from 'lucide-react'

export type { ProductComboboxOption }

type ProductComboboxProps = {
  label: string
  products: readonly ProductComboboxOption[]
  value: string
  onChange: (productId: string) => void
  className?: string
}

/** Type or pick from list — stores catalog `productId`. */
export function ProductCombobox({ label, products, value, onChange, className }: ProductComboboxProps) {
  const { pickName, locale } = useI18n()
  const anchorRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const cmdkInputRef = useRef<HTMLInputElement>(null)
  const listId = useId()
  const inputId = useId()
  const selectingRef = useRef(false)

  const labelOf = useCallback(
    (p: ProductComboboxOption) => productDisplayName(p, locale, pickName),
    [locale, pickName],
  )

  const selected = products.find((p) => p.id === value)
  const closedDisplay = selected ? labelOf(selected) : value

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const inputValue = open ? query : closedDisplay

  const filtered = useMemo(
    () => filterProductsByQuery(products, open ? query : '', labelOf),
    [open, query, products, labelOf],
  )

  const applyQuery = useCallback(
    (next: string) => {
      setQuery(next)
      setOpen(true)
      onChange(resolveProductId(next, products, labelOf))
    },
    [labelOf, onChange, products],
  )

  const openPicker = useCallback(() => {
    setQuery(closedDisplay)
    setOpen(true)
  }, [closedDisplay])

  const commitAndClose = useCallback(
    (text: string) => {
      onChange(resolveProductId(text, products, labelOf))
      setOpen(false)
      setQuery('')
    },
    [labelOf, onChange, products],
  )

  const selectProduct = useCallback(
    (p: ProductComboboxOption) => {
      selectingRef.current = true
      onChange(p.id)
      setOpen(false)
      setQuery('')
      requestAnimationFrame(() => {
        selectingRef.current = false
        inputRef.current?.focus()
      })
    },
    [onChange],
  )

  const focusCmdkInput = useCallback(() => {
    setOpen(true)
    requestAnimationFrame(() => {
      cmdkInputRef.current?.focus()
    })
  }, [])

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        openPicker()
        return
      }
      if (selectingRef.current) {
        setOpen(false)
        setQuery('')
        return
      }
      commitAndClose(query)
    },
    [commitAndClose, openPicker, query],
  )

  return (
    <div className={className ?? 'space-y-1'}>
      <Label htmlFor={inputId}>{label}</Label>
      <Popover open={open} onOpenChange={handleOpenChange} modal={false}>
        <div ref={anchorRef} className="relative flex w-full items-center">
          <Input
            ref={inputRef}
            id={inputId}
            value={inputValue}
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            className="pr-8"
            onFocus={openPicker}
            onChange={(e) => applyQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault()
                setOpen(false)
                setQuery('')
                inputRef.current?.blur()
                return
              }
              if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault()
                if (!open) {
                  setQuery(inputValue)
                }
                focusCmdkInput()
              }
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute right-0 size-8 shrink-0 text-muted-foreground"
            aria-label={`${label} options`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              if (open) {
                handleOpenChange(false)
              } else {
                openPicker()
                inputRef.current?.focus()
              }
            }}
          >
            <ChevronDownIcon className={cn('size-4 opacity-50 transition-transform', open && 'rotate-180')} />
          </Button>
        </div>
        {open ? (
          <PopoverContent
            anchor={anchorRef}
            align="start"
            sideOffset={4}
            className="w-[var(--anchor-width,100%)] p-0"
          >
            <Command shouldFilter={false} value={query} onValueChange={applyQuery}>
              {/* ponytail: cmdk focus target for arrow keys; visible field stays primary */}
              <CommandInput
                ref={cmdkInputRef}
                aria-hidden
                tabIndex={-1}
                wrapperClassName="sr-only p-0 [&_[data-slot=input-group-addon]]:hidden"
                className="h-px w-px min-h-0 border-0 p-0 opacity-0"
              />
              <CommandList id={listId}>
                {filtered.length === 0 ? (
                  <CommandEmpty>No match</CommandEmpty>
                ) : (
                  filtered.map((p) => (
                    <CommandItem
                      key={p.id}
                      value={p.id}
                      onMouseDown={(e) => e.preventDefault()}
                      onSelect={() => selectProduct(p)}
                    >
                      {labelOf(p)}
                    </CommandItem>
                  ))
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        ) : null}
      </Popover>
    </div>
  )
}
