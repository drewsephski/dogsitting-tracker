import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";
import * as z from "zod";
import { type ClientWithStats, clientInputSchema } from "@/lib/definitions";
import { getSortingStateParser } from "@/lib/parsers";

export const searchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<ClientWithStats>().withDefault([
    { id: "dogName", desc: false },
  ]),
  dogName: parseAsString.withDefault(""),
  isRepeatClient: parseAsArrayOf(
    parseAsStringLiteral(["true", "false"]),
  ).withDefault([]),
});

export type GetClientsSchema = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>;

export const clientFormSchema = clientInputSchema.omit({ id: true });

export type ClientFormSchema = z.infer<typeof clientFormSchema>;

export const clientPatchSchema = z.object({
  id: z.string().min(1),
  dogName: z.string().min(1).max(128).optional(),
  ownerName: z.string().max(128).nullable().optional(),
  contactEmail: z
    .string()
    .email()
    .max(256)
    .nullable()
    .optional()
    .or(z.literal("")),
  contactPhone: z.string().max(32).nullable().optional(),
});

export type ClientPatchSchema = z.infer<typeof clientPatchSchema>;

export function parseClientFormInput(data: ClientFormSchema, id?: string) {
  return clientInputSchema.parse({
    ...data,
    id,
    ownerName: data.ownerName?.trim() ? data.ownerName.trim() : undefined,
    contactPhone: data.contactPhone?.trim()
      ? data.contactPhone.trim()
      : undefined,
  });
}
