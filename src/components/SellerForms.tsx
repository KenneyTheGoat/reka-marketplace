"use client";

import { useActionState } from "react";
import { PlusCircle, Send } from "lucide-react";
import { applyToSell, createProduct } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Fields";

export function SellerApplicationForm({ countries }: { countries: { code: string; name: string }[] }) {
  const [state, action, pending] = useActionState(applyToSell, null);
  return (
    <form action={action} className="grid gap-4">
      <Field label="Business name"><input className={inputClass} name="businessName" required /></Field>
      <Field label="Business description"><textarea className={inputClass} name="description" rows={5} required /></Field>
      <Field label="Base country">
        <select className={inputClass} name="countryCode" required>
          {countries.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}
        </select>
      </Field>
      {"error" in (state ?? {}) ? <p className="text-sm font-medium text-clay">{state?.error}</p> : null}
      {"success" in (state ?? {}) ? <p className="text-sm font-medium text-veld">{state?.success}</p> : null}
      <Button disabled={pending}><Send size={18} /> Submit application</Button>
    </form>
  );
}

export function ProductForm({
  categories,
  countries
}: {
  categories: { id: string; name: string }[];
  countries: { code: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(createProduct, null);
  return (
    <form action={action} className="grid gap-4">
      <Field label="Product name"><input className={inputClass} name="name" required /></Field>
      <Field label="Description"><textarea className={inputClass} name="description" rows={4} required /></Field>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Category">
          <select className={inputClass} name="categoryId" required>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </Field>
        <Field label="Price"><input className={inputClass} name="price" type="number" min="1" step="0.01" required /></Field>
        <Field label="Stock"><input className={inputClass} name="stock" type="number" min="0" required /></Field>
      </div>
      <Field label="Image URL"><input className={inputClass} name="imageUrl" type="url" required /></Field>
      <Field label="Delivery notes"><textarea className={inputClass} name="deliveryNotes" rows={3} required /></Field>
      <div className="grid gap-2">
        <p className="text-sm font-medium">Country availability</p>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
          {countries.map((country) => (
            <label key={country.code} className="flex items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm">
              <input type="checkbox" name="countries" value={country.code} defaultChecked={country.code === "ZA"} />
              {country.name}
            </label>
          ))}
        </div>
      </div>
      {"error" in (state ?? {}) ? <p className="text-sm font-medium text-clay">{state?.error}</p> : null}
      {"success" in (state ?? {}) ? <p className="text-sm font-medium text-veld">{state?.success}</p> : null}
      <Button disabled={pending}><PlusCircle size={18} /> Submit for approval</Button>
    </form>
  );
}

