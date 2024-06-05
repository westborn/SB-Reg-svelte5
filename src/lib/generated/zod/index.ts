import { z } from 'zod';
import type { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const ArtistTableScalarFieldEnumSchema = z.enum(['id','email','firstName','lastName','phone','postcode','firstNations','bankAccountName','bankBSB','bankAccount','createdAt','updatedAt']);

export const RegistrationTableScalarFieldEnumSchema = z.enum(['id','artistId','registrationYear','closed','bumpIn','bumpOut','displayRequirements','accommodation','crane','transport','createdAt','updatedAt']);

export const EntryTableScalarFieldEnumSchema = z.enum(['id','artistId','accepted','registrationId','description','dimensions','enterMajorPrize','inOrOut','material','price','specialRequirements','title','createdAt','updatedAt']);

export const ImageTableScalarFieldEnumSchema = z.enum(['id','artistId','registrationId','entryId','cloudId','cloudURL','originalFileName','createdAt','updatedAt']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const NullsOrderSchema = z.enum(['first','last']);

export const IndigenousSchema = z.enum(['Yes','No','Declined']);

export type IndigenousType = `${z.infer<typeof IndigenousSchema>}`

export const EntryTypeSchema = z.enum(['Indoor','Outdoor']);

export type EntryTypeType = `${z.infer<typeof EntryTypeSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// ARTIST TABLE SCHEMA
/////////////////////////////////////////

export const artistTableSchema = z.object({
  firstNations: IndigenousSchema,
  id: z.number().int(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  postcode: z.string(),
  bankAccountName: z.string().nullable(),
  bankBSB: z.string().nullable(),
  bankAccount: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type artistTable = z.infer<typeof artistTableSchema>

/////////////////////////////////////////
// REGISTRATION TABLE SCHEMA
/////////////////////////////////////////

export const registrationTableSchema = z.object({
  id: z.number().int(),
  artistId: z.number().int(),
  registrationYear: z.string(),
  closed: z.boolean(),
  bumpIn: z.string().nullable(),
  bumpOut: z.string().nullable(),
  displayRequirements: z.string().nullable(),
  accommodation: z.boolean().nullable(),
  crane: z.boolean().nullable(),
  transport: z.boolean().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type registrationTable = z.infer<typeof registrationTableSchema>

/////////////////////////////////////////
// ENTRY TABLE SCHEMA
/////////////////////////////////////////

export const entryTableSchema = z.object({
  inOrOut: EntryTypeSchema.nullable(),
  id: z.number().int(),
  artistId: z.number().int(),
  accepted: z.boolean(),
  registrationId: z.number().int(),
  description: z.string().nullable(),
  dimensions: z.string().nullable(),
  enterMajorPrize: z.boolean(),
  material: z.string().nullable(),
  price: z.number().int().nullable(),
  specialRequirements: z.string().nullable(),
  title: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type entryTable = z.infer<typeof entryTableSchema>

/////////////////////////////////////////
// IMAGE TABLE SCHEMA
/////////////////////////////////////////

export const imageTableSchema = z.object({
  id: z.number().int(),
  artistId: z.number().int(),
  registrationId: z.number().int().nullable(),
  entryId: z.number().int().nullable(),
  cloudId: z.string(),
  cloudURL: z.string(),
  originalFileName: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type imageTable = z.infer<typeof imageTableSchema>

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// ARTIST TABLE
//------------------------------------------------------

export const artistTableIncludeSchema: z.ZodType<Prisma.artistTableInclude> = z.object({
  registrations: z.union([z.boolean(),z.lazy(() => registrationTableFindManyArgsSchema)]).optional(),
  images: z.union([z.boolean(),z.lazy(() => imageTableFindManyArgsSchema)]).optional(),
  entries: z.union([z.boolean(),z.lazy(() => entryTableFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ArtistTableCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const artistTableArgsSchema: z.ZodType<Prisma.artistTableDefaultArgs> = z.object({
  select: z.lazy(() => artistTableSelectSchema).optional(),
  include: z.lazy(() => artistTableIncludeSchema).optional(),
}).strict();

export const artistTableCountOutputTypeArgsSchema: z.ZodType<Prisma.artistTableCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => artistTableCountOutputTypeSelectSchema).nullish(),
}).strict();

export const artistTableCountOutputTypeSelectSchema: z.ZodType<Prisma.artistTableCountOutputTypeSelect> = z.object({
  registrations: z.boolean().optional(),
  images: z.boolean().optional(),
  entries: z.boolean().optional(),
}).strict();

export const artistTableSelectSchema: z.ZodType<Prisma.artistTableSelect> = z.object({
  id: z.boolean().optional(),
  email: z.boolean().optional(),
  firstName: z.boolean().optional(),
  lastName: z.boolean().optional(),
  phone: z.boolean().optional(),
  postcode: z.boolean().optional(),
  firstNations: z.boolean().optional(),
  bankAccountName: z.boolean().optional(),
  bankBSB: z.boolean().optional(),
  bankAccount: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  registrations: z.union([z.boolean(),z.lazy(() => registrationTableFindManyArgsSchema)]).optional(),
  images: z.union([z.boolean(),z.lazy(() => imageTableFindManyArgsSchema)]).optional(),
  entries: z.union([z.boolean(),z.lazy(() => entryTableFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ArtistTableCountOutputTypeArgsSchema)]).optional(),
}).strict()

// REGISTRATION TABLE
//------------------------------------------------------

export const registrationTableIncludeSchema: z.ZodType<Prisma.registrationTableInclude> = z.object({
  artist: z.union([z.boolean(),z.lazy(() => artistTableArgsSchema)]).optional(),
  entries: z.union([z.boolean(),z.lazy(() => entryTableFindManyArgsSchema)]).optional(),
  images: z.union([z.boolean(),z.lazy(() => imageTableFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => RegistrationTableCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const registrationTableArgsSchema: z.ZodType<Prisma.registrationTableDefaultArgs> = z.object({
  select: z.lazy(() => registrationTableSelectSchema).optional(),
  include: z.lazy(() => registrationTableIncludeSchema).optional(),
}).strict();

export const registrationTableCountOutputTypeArgsSchema: z.ZodType<Prisma.registrationTableCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => registrationTableCountOutputTypeSelectSchema).nullish(),
}).strict();

export const registrationTableCountOutputTypeSelectSchema: z.ZodType<Prisma.registrationTableCountOutputTypeSelect> = z.object({
  entries: z.boolean().optional(),
  images: z.boolean().optional(),
}).strict();

export const registrationTableSelectSchema: z.ZodType<Prisma.registrationTableSelect> = z.object({
  id: z.boolean().optional(),
  artistId: z.boolean().optional(),
  registrationYear: z.boolean().optional(),
  closed: z.boolean().optional(),
  bumpIn: z.boolean().optional(),
  bumpOut: z.boolean().optional(),
  displayRequirements: z.boolean().optional(),
  accommodation: z.boolean().optional(),
  crane: z.boolean().optional(),
  transport: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  artist: z.union([z.boolean(),z.lazy(() => artistTableArgsSchema)]).optional(),
  entries: z.union([z.boolean(),z.lazy(() => entryTableFindManyArgsSchema)]).optional(),
  images: z.union([z.boolean(),z.lazy(() => imageTableFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => RegistrationTableCountOutputTypeArgsSchema)]).optional(),
}).strict()

// ENTRY TABLE
//------------------------------------------------------

export const entryTableIncludeSchema: z.ZodType<Prisma.entryTableInclude> = z.object({
  images: z.union([z.boolean(),z.lazy(() => imageTableFindManyArgsSchema)]).optional(),
  artist: z.union([z.boolean(),z.lazy(() => artistTableArgsSchema)]).optional(),
  registration: z.union([z.boolean(),z.lazy(() => registrationTableArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => EntryTableCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const entryTableArgsSchema: z.ZodType<Prisma.entryTableDefaultArgs> = z.object({
  select: z.lazy(() => entryTableSelectSchema).optional(),
  include: z.lazy(() => entryTableIncludeSchema).optional(),
}).strict();

export const entryTableCountOutputTypeArgsSchema: z.ZodType<Prisma.entryTableCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => entryTableCountOutputTypeSelectSchema).nullish(),
}).strict();

export const entryTableCountOutputTypeSelectSchema: z.ZodType<Prisma.entryTableCountOutputTypeSelect> = z.object({
  images: z.boolean().optional(),
}).strict();

export const entryTableSelectSchema: z.ZodType<Prisma.entryTableSelect> = z.object({
  id: z.boolean().optional(),
  artistId: z.boolean().optional(),
  accepted: z.boolean().optional(),
  registrationId: z.boolean().optional(),
  description: z.boolean().optional(),
  dimensions: z.boolean().optional(),
  enterMajorPrize: z.boolean().optional(),
  inOrOut: z.boolean().optional(),
  material: z.boolean().optional(),
  price: z.boolean().optional(),
  specialRequirements: z.boolean().optional(),
  title: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  images: z.union([z.boolean(),z.lazy(() => imageTableFindManyArgsSchema)]).optional(),
  artist: z.union([z.boolean(),z.lazy(() => artistTableArgsSchema)]).optional(),
  registration: z.union([z.boolean(),z.lazy(() => registrationTableArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => EntryTableCountOutputTypeArgsSchema)]).optional(),
}).strict()

// IMAGE TABLE
//------------------------------------------------------

export const imageTableIncludeSchema: z.ZodType<Prisma.imageTableInclude> = z.object({
  artist: z.union([z.boolean(),z.lazy(() => artistTableArgsSchema)]).optional(),
  registration: z.union([z.boolean(),z.lazy(() => registrationTableArgsSchema)]).optional(),
  entry: z.union([z.boolean(),z.lazy(() => entryTableArgsSchema)]).optional(),
}).strict()

export const imageTableArgsSchema: z.ZodType<Prisma.imageTableDefaultArgs> = z.object({
  select: z.lazy(() => imageTableSelectSchema).optional(),
  include: z.lazy(() => imageTableIncludeSchema).optional(),
}).strict();

export const imageTableSelectSchema: z.ZodType<Prisma.imageTableSelect> = z.object({
  id: z.boolean().optional(),
  artistId: z.boolean().optional(),
  registrationId: z.boolean().optional(),
  entryId: z.boolean().optional(),
  cloudId: z.boolean().optional(),
  cloudURL: z.boolean().optional(),
  originalFileName: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  artist: z.union([z.boolean(),z.lazy(() => artistTableArgsSchema)]).optional(),
  registration: z.union([z.boolean(),z.lazy(() => registrationTableArgsSchema)]).optional(),
  entry: z.union([z.boolean(),z.lazy(() => entryTableArgsSchema)]).optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const artistTableWhereInputSchema: z.ZodType<Prisma.artistTableWhereInput> = z.object({
  AND: z.union([ z.lazy(() => artistTableWhereInputSchema),z.lazy(() => artistTableWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => artistTableWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => artistTableWhereInputSchema),z.lazy(() => artistTableWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  email: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  firstName: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  lastName: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  phone: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  postcode: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  firstNations: z.union([ z.lazy(() => EnumIndigenousFilterSchema),z.lazy(() => IndigenousSchema) ]).optional(),
  bankAccountName: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  bankBSB: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  bankAccount: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  registrations: z.lazy(() => RegistrationTableListRelationFilterSchema).optional(),
  images: z.lazy(() => ImageTableListRelationFilterSchema).optional(),
  entries: z.lazy(() => EntryTableListRelationFilterSchema).optional()
}).strict();

export const artistTableOrderByWithRelationInputSchema: z.ZodType<Prisma.artistTableOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  phone: z.lazy(() => SortOrderSchema).optional(),
  postcode: z.lazy(() => SortOrderSchema).optional(),
  firstNations: z.lazy(() => SortOrderSchema).optional(),
  bankAccountName: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  bankBSB: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  bankAccount: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  registrations: z.lazy(() => registrationTableOrderByRelationAggregateInputSchema).optional(),
  images: z.lazy(() => imageTableOrderByRelationAggregateInputSchema).optional(),
  entries: z.lazy(() => entryTableOrderByRelationAggregateInputSchema).optional()
}).strict();

export const artistTableWhereUniqueInputSchema: z.ZodType<Prisma.artistTableWhereUniqueInput> = z.union([
  z.object({
    id: z.number().int(),
    email: z.string()
  }),
  z.object({
    id: z.number().int(),
  }),
  z.object({
    email: z.string(),
  }),
])
.and(z.object({
  id: z.number().int().optional(),
  email: z.string().optional(),
  AND: z.union([ z.lazy(() => artistTableWhereInputSchema),z.lazy(() => artistTableWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => artistTableWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => artistTableWhereInputSchema),z.lazy(() => artistTableWhereInputSchema).array() ]).optional(),
  firstName: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  lastName: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  phone: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  postcode: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  firstNations: z.union([ z.lazy(() => EnumIndigenousFilterSchema),z.lazy(() => IndigenousSchema) ]).optional(),
  bankAccountName: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  bankBSB: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  bankAccount: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  registrations: z.lazy(() => RegistrationTableListRelationFilterSchema).optional(),
  images: z.lazy(() => ImageTableListRelationFilterSchema).optional(),
  entries: z.lazy(() => EntryTableListRelationFilterSchema).optional()
}).strict());

export const artistTableOrderByWithAggregationInputSchema: z.ZodType<Prisma.artistTableOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  phone: z.lazy(() => SortOrderSchema).optional(),
  postcode: z.lazy(() => SortOrderSchema).optional(),
  firstNations: z.lazy(() => SortOrderSchema).optional(),
  bankAccountName: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  bankBSB: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  bankAccount: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => artistTableCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => artistTableAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => artistTableMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => artistTableMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => artistTableSumOrderByAggregateInputSchema).optional()
}).strict();

export const artistTableScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.artistTableScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => artistTableScalarWhereWithAggregatesInputSchema),z.lazy(() => artistTableScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => artistTableScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => artistTableScalarWhereWithAggregatesInputSchema),z.lazy(() => artistTableScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  email: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  firstName: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  lastName: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  phone: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  postcode: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  firstNations: z.union([ z.lazy(() => EnumIndigenousWithAggregatesFilterSchema),z.lazy(() => IndigenousSchema) ]).optional(),
  bankAccountName: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  bankBSB: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  bankAccount: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const registrationTableWhereInputSchema: z.ZodType<Prisma.registrationTableWhereInput> = z.object({
  AND: z.union([ z.lazy(() => registrationTableWhereInputSchema),z.lazy(() => registrationTableWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => registrationTableWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => registrationTableWhereInputSchema),z.lazy(() => registrationTableWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  artistId: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  registrationYear: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  closed: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  bumpIn: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  bumpOut: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  displayRequirements: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  accommodation: z.union([ z.lazy(() => BoolNullableFilterSchema),z.boolean() ]).optional().nullable(),
  crane: z.union([ z.lazy(() => BoolNullableFilterSchema),z.boolean() ]).optional().nullable(),
  transport: z.union([ z.lazy(() => BoolNullableFilterSchema),z.boolean() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  artist: z.union([ z.lazy(() => ArtistTableRelationFilterSchema),z.lazy(() => artistTableWhereInputSchema) ]).optional(),
  entries: z.lazy(() => EntryTableListRelationFilterSchema).optional(),
  images: z.lazy(() => ImageTableListRelationFilterSchema).optional()
}).strict();

export const registrationTableOrderByWithRelationInputSchema: z.ZodType<Prisma.registrationTableOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  artistId: z.lazy(() => SortOrderSchema).optional(),
  registrationYear: z.lazy(() => SortOrderSchema).optional(),
  closed: z.lazy(() => SortOrderSchema).optional(),
  bumpIn: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  bumpOut: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  displayRequirements: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  accommodation: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  crane: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  transport: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  artist: z.lazy(() => artistTableOrderByWithRelationInputSchema).optional(),
  entries: z.lazy(() => entryTableOrderByRelationAggregateInputSchema).optional(),
  images: z.lazy(() => imageTableOrderByRelationAggregateInputSchema).optional()
}).strict();

export const registrationTableWhereUniqueInputSchema: z.ZodType<Prisma.registrationTableWhereUniqueInput> = z.object({
  id: z.number().int()
})
.and(z.object({
  id: z.number().int().optional(),
  AND: z.union([ z.lazy(() => registrationTableWhereInputSchema),z.lazy(() => registrationTableWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => registrationTableWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => registrationTableWhereInputSchema),z.lazy(() => registrationTableWhereInputSchema).array() ]).optional(),
  artistId: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  registrationYear: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  closed: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  bumpIn: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  bumpOut: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  displayRequirements: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  accommodation: z.union([ z.lazy(() => BoolNullableFilterSchema),z.boolean() ]).optional().nullable(),
  crane: z.union([ z.lazy(() => BoolNullableFilterSchema),z.boolean() ]).optional().nullable(),
  transport: z.union([ z.lazy(() => BoolNullableFilterSchema),z.boolean() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  artist: z.union([ z.lazy(() => ArtistTableRelationFilterSchema),z.lazy(() => artistTableWhereInputSchema) ]).optional(),
  entries: z.lazy(() => EntryTableListRelationFilterSchema).optional(),
  images: z.lazy(() => ImageTableListRelationFilterSchema).optional()
}).strict());

export const registrationTableOrderByWithAggregationInputSchema: z.ZodType<Prisma.registrationTableOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  artistId: z.lazy(() => SortOrderSchema).optional(),
  registrationYear: z.lazy(() => SortOrderSchema).optional(),
  closed: z.lazy(() => SortOrderSchema).optional(),
  bumpIn: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  bumpOut: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  displayRequirements: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  accommodation: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  crane: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  transport: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => registrationTableCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => registrationTableAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => registrationTableMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => registrationTableMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => registrationTableSumOrderByAggregateInputSchema).optional()
}).strict();

export const registrationTableScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.registrationTableScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => registrationTableScalarWhereWithAggregatesInputSchema),z.lazy(() => registrationTableScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => registrationTableScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => registrationTableScalarWhereWithAggregatesInputSchema),z.lazy(() => registrationTableScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  artistId: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  registrationYear: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  closed: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  bumpIn: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  bumpOut: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  displayRequirements: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  accommodation: z.union([ z.lazy(() => BoolNullableWithAggregatesFilterSchema),z.boolean() ]).optional().nullable(),
  crane: z.union([ z.lazy(() => BoolNullableWithAggregatesFilterSchema),z.boolean() ]).optional().nullable(),
  transport: z.union([ z.lazy(() => BoolNullableWithAggregatesFilterSchema),z.boolean() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const entryTableWhereInputSchema: z.ZodType<Prisma.entryTableWhereInput> = z.object({
  AND: z.union([ z.lazy(() => entryTableWhereInputSchema),z.lazy(() => entryTableWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => entryTableWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => entryTableWhereInputSchema),z.lazy(() => entryTableWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  artistId: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  accepted: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  registrationId: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  dimensions: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  enterMajorPrize: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  inOrOut: z.union([ z.lazy(() => EnumEntryTypeNullableFilterSchema),z.lazy(() => EntryTypeSchema) ]).optional().nullable(),
  material: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  price: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  specialRequirements: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  title: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  images: z.lazy(() => ImageTableListRelationFilterSchema).optional(),
  artist: z.union([ z.lazy(() => ArtistTableRelationFilterSchema),z.lazy(() => artistTableWhereInputSchema) ]).optional(),
  registration: z.union([ z.lazy(() => RegistrationTableRelationFilterSchema),z.lazy(() => registrationTableWhereInputSchema) ]).optional(),
}).strict();

export const entryTableOrderByWithRelationInputSchema: z.ZodType<Prisma.entryTableOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  artistId: z.lazy(() => SortOrderSchema).optional(),
  accepted: z.lazy(() => SortOrderSchema).optional(),
  registrationId: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  dimensions: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  enterMajorPrize: z.lazy(() => SortOrderSchema).optional(),
  inOrOut: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  material: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  price: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  specialRequirements: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  images: z.lazy(() => imageTableOrderByRelationAggregateInputSchema).optional(),
  artist: z.lazy(() => artistTableOrderByWithRelationInputSchema).optional(),
  registration: z.lazy(() => registrationTableOrderByWithRelationInputSchema).optional()
}).strict();

export const entryTableWhereUniqueInputSchema: z.ZodType<Prisma.entryTableWhereUniqueInput> = z.object({
  id: z.number().int()
})
.and(z.object({
  id: z.number().int().optional(),
  AND: z.union([ z.lazy(() => entryTableWhereInputSchema),z.lazy(() => entryTableWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => entryTableWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => entryTableWhereInputSchema),z.lazy(() => entryTableWhereInputSchema).array() ]).optional(),
  artistId: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  accepted: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  registrationId: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  dimensions: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  enterMajorPrize: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  inOrOut: z.union([ z.lazy(() => EnumEntryTypeNullableFilterSchema),z.lazy(() => EntryTypeSchema) ]).optional().nullable(),
  material: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  price: z.union([ z.lazy(() => IntNullableFilterSchema),z.number().int() ]).optional().nullable(),
  specialRequirements: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  title: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  images: z.lazy(() => ImageTableListRelationFilterSchema).optional(),
  artist: z.union([ z.lazy(() => ArtistTableRelationFilterSchema),z.lazy(() => artistTableWhereInputSchema) ]).optional(),
  registration: z.union([ z.lazy(() => RegistrationTableRelationFilterSchema),z.lazy(() => registrationTableWhereInputSchema) ]).optional(),
}).strict());

export const entryTableOrderByWithAggregationInputSchema: z.ZodType<Prisma.entryTableOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  artistId: z.lazy(() => SortOrderSchema).optional(),
  accepted: z.lazy(() => SortOrderSchema).optional(),
  registrationId: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  dimensions: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  enterMajorPrize: z.lazy(() => SortOrderSchema).optional(),
  inOrOut: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  material: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  price: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  specialRequirements: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => entryTableCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => entryTableAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => entryTableMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => entryTableMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => entryTableSumOrderByAggregateInputSchema).optional()
}).strict();

export const entryTableScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.entryTableScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => entryTableScalarWhereWithAggregatesInputSchema),z.lazy(() => entryTableScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => entryTableScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => entryTableScalarWhereWithAggregatesInputSchema),z.lazy(() => entryTableScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  artistId: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  accepted: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  registrationId: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  dimensions: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  enterMajorPrize: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  inOrOut: z.union([ z.lazy(() => EnumEntryTypeNullableWithAggregatesFilterSchema),z.lazy(() => EntryTypeSchema) ]).optional().nullable(),
  material: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  price: z.union([ z.lazy(() => IntNullableWithAggregatesFilterSchema),z.number() ]).optional().nullable(),
  specialRequirements: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  title: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const imageTableWhereInputSchema: z.ZodType<Prisma.imageTableWhereInput> = z.object({
  AND: z.union([ z.lazy(() => imageTableWhereInputSchema),z.lazy(() => imageTableWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => imageTableWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => imageTableWhereInputSchema),z.lazy(() => imageTableWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  artistId: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  registrationId: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  entryId: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  cloudId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  cloudURL: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  originalFileName: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  artist: z.union([ z.lazy(() => ArtistTableRelationFilterSchema),z.lazy(() => artistTableWhereInputSchema) ]).optional(),
  registration: z.union([ z.lazy(() => RegistrationTableNullableRelationFilterSchema),z.lazy(() => registrationTableWhereInputSchema) ]).optional().nullable(),
  entry: z.union([ z.lazy(() => EntryTableNullableRelationFilterSchema),z.lazy(() => entryTableWhereInputSchema) ]).optional().nullable(),
}).strict();

export const imageTableOrderByWithRelationInputSchema: z.ZodType<Prisma.imageTableOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  artistId: z.lazy(() => SortOrderSchema).optional(),
  registrationId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  entryId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  cloudId: z.lazy(() => SortOrderSchema).optional(),
  cloudURL: z.lazy(() => SortOrderSchema).optional(),
  originalFileName: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  artist: z.lazy(() => artistTableOrderByWithRelationInputSchema).optional(),
  registration: z.lazy(() => registrationTableOrderByWithRelationInputSchema).optional(),
  entry: z.lazy(() => entryTableOrderByWithRelationInputSchema).optional()
}).strict();

export const imageTableWhereUniqueInputSchema: z.ZodType<Prisma.imageTableWhereUniqueInput> = z.object({
  id: z.number().int()
})
.and(z.object({
  id: z.number().int().optional(),
  AND: z.union([ z.lazy(() => imageTableWhereInputSchema),z.lazy(() => imageTableWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => imageTableWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => imageTableWhereInputSchema),z.lazy(() => imageTableWhereInputSchema).array() ]).optional(),
  artistId: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  registrationId: z.union([ z.lazy(() => IntNullableFilterSchema),z.number().int() ]).optional().nullable(),
  entryId: z.union([ z.lazy(() => IntNullableFilterSchema),z.number().int() ]).optional().nullable(),
  cloudId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  cloudURL: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  originalFileName: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  artist: z.union([ z.lazy(() => ArtistTableRelationFilterSchema),z.lazy(() => artistTableWhereInputSchema) ]).optional(),
  registration: z.union([ z.lazy(() => RegistrationTableNullableRelationFilterSchema),z.lazy(() => registrationTableWhereInputSchema) ]).optional().nullable(),
  entry: z.union([ z.lazy(() => EntryTableNullableRelationFilterSchema),z.lazy(() => entryTableWhereInputSchema) ]).optional().nullable(),
}).strict());

export const imageTableOrderByWithAggregationInputSchema: z.ZodType<Prisma.imageTableOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  artistId: z.lazy(() => SortOrderSchema).optional(),
  registrationId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  entryId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  cloudId: z.lazy(() => SortOrderSchema).optional(),
  cloudURL: z.lazy(() => SortOrderSchema).optional(),
  originalFileName: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => imageTableCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => imageTableAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => imageTableMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => imageTableMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => imageTableSumOrderByAggregateInputSchema).optional()
}).strict();

export const imageTableScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.imageTableScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => imageTableScalarWhereWithAggregatesInputSchema),z.lazy(() => imageTableScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => imageTableScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => imageTableScalarWhereWithAggregatesInputSchema),z.lazy(() => imageTableScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  artistId: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  registrationId: z.union([ z.lazy(() => IntNullableWithAggregatesFilterSchema),z.number() ]).optional().nullable(),
  entryId: z.union([ z.lazy(() => IntNullableWithAggregatesFilterSchema),z.number() ]).optional().nullable(),
  cloudId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  cloudURL: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  originalFileName: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const artistTableCreateInputSchema: z.ZodType<Prisma.artistTableCreateInput> = z.object({
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  postcode: z.string(),
  firstNations: z.lazy(() => IndigenousSchema).optional(),
  bankAccountName: z.string().optional().nullable(),
  bankBSB: z.string().optional().nullable(),
  bankAccount: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  registrations: z.lazy(() => registrationTableCreateNestedManyWithoutArtistInputSchema).optional(),
  images: z.lazy(() => imageTableCreateNestedManyWithoutArtistInputSchema).optional(),
  entries: z.lazy(() => entryTableCreateNestedManyWithoutArtistInputSchema).optional()
}).strict();

export const artistTableUncheckedCreateInputSchema: z.ZodType<Prisma.artistTableUncheckedCreateInput> = z.object({
  id: z.number().int().optional(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  postcode: z.string(),
  firstNations: z.lazy(() => IndigenousSchema).optional(),
  bankAccountName: z.string().optional().nullable(),
  bankBSB: z.string().optional().nullable(),
  bankAccount: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  registrations: z.lazy(() => registrationTableUncheckedCreateNestedManyWithoutArtistInputSchema).optional(),
  images: z.lazy(() => imageTableUncheckedCreateNestedManyWithoutArtistInputSchema).optional(),
  entries: z.lazy(() => entryTableUncheckedCreateNestedManyWithoutArtistInputSchema).optional()
}).strict();

export const artistTableUpdateInputSchema: z.ZodType<Prisma.artistTableUpdateInput> = z.object({
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  postcode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstNations: z.union([ z.lazy(() => IndigenousSchema),z.lazy(() => EnumIndigenousFieldUpdateOperationsInputSchema) ]).optional(),
  bankAccountName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bankBSB: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bankAccount: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  registrations: z.lazy(() => registrationTableUpdateManyWithoutArtistNestedInputSchema).optional(),
  images: z.lazy(() => imageTableUpdateManyWithoutArtistNestedInputSchema).optional(),
  entries: z.lazy(() => entryTableUpdateManyWithoutArtistNestedInputSchema).optional()
}).strict();

export const artistTableUncheckedUpdateInputSchema: z.ZodType<Prisma.artistTableUncheckedUpdateInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  postcode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstNations: z.union([ z.lazy(() => IndigenousSchema),z.lazy(() => EnumIndigenousFieldUpdateOperationsInputSchema) ]).optional(),
  bankAccountName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bankBSB: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bankAccount: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  registrations: z.lazy(() => registrationTableUncheckedUpdateManyWithoutArtistNestedInputSchema).optional(),
  images: z.lazy(() => imageTableUncheckedUpdateManyWithoutArtistNestedInputSchema).optional(),
  entries: z.lazy(() => entryTableUncheckedUpdateManyWithoutArtistNestedInputSchema).optional()
}).strict();

export const artistTableCreateManyInputSchema: z.ZodType<Prisma.artistTableCreateManyInput> = z.object({
  id: z.number().int().optional(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  postcode: z.string(),
  firstNations: z.lazy(() => IndigenousSchema).optional(),
  bankAccountName: z.string().optional().nullable(),
  bankBSB: z.string().optional().nullable(),
  bankAccount: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const artistTableUpdateManyMutationInputSchema: z.ZodType<Prisma.artistTableUpdateManyMutationInput> = z.object({
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  postcode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstNations: z.union([ z.lazy(() => IndigenousSchema),z.lazy(() => EnumIndigenousFieldUpdateOperationsInputSchema) ]).optional(),
  bankAccountName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bankBSB: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bankAccount: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const artistTableUncheckedUpdateManyInputSchema: z.ZodType<Prisma.artistTableUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  postcode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstNations: z.union([ z.lazy(() => IndigenousSchema),z.lazy(() => EnumIndigenousFieldUpdateOperationsInputSchema) ]).optional(),
  bankAccountName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bankBSB: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bankAccount: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const registrationTableCreateInputSchema: z.ZodType<Prisma.registrationTableCreateInput> = z.object({
  registrationYear: z.string(),
  closed: z.boolean().optional(),
  bumpIn: z.string().optional().nullable(),
  bumpOut: z.string().optional().nullable(),
  displayRequirements: z.string().optional().nullable(),
  accommodation: z.boolean().optional().nullable(),
  crane: z.boolean().optional().nullable(),
  transport: z.boolean().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  artist: z.lazy(() => artistTableCreateNestedOneWithoutRegistrationsInputSchema),
  entries: z.lazy(() => entryTableCreateNestedManyWithoutRegistrationInputSchema).optional(),
  images: z.lazy(() => imageTableCreateNestedManyWithoutRegistrationInputSchema).optional()
}).strict();

export const registrationTableUncheckedCreateInputSchema: z.ZodType<Prisma.registrationTableUncheckedCreateInput> = z.object({
  id: z.number().int().optional(),
  artistId: z.number().int(),
  registrationYear: z.string(),
  closed: z.boolean().optional(),
  bumpIn: z.string().optional().nullable(),
  bumpOut: z.string().optional().nullable(),
  displayRequirements: z.string().optional().nullable(),
  accommodation: z.boolean().optional().nullable(),
  crane: z.boolean().optional().nullable(),
  transport: z.boolean().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  entries: z.lazy(() => entryTableUncheckedCreateNestedManyWithoutRegistrationInputSchema).optional(),
  images: z.lazy(() => imageTableUncheckedCreateNestedManyWithoutRegistrationInputSchema).optional()
}).strict();

export const registrationTableUpdateInputSchema: z.ZodType<Prisma.registrationTableUpdateInput> = z.object({
  registrationYear: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  closed: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  bumpIn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bumpOut: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  displayRequirements: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accommodation: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  crane: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  transport: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  artist: z.lazy(() => artistTableUpdateOneRequiredWithoutRegistrationsNestedInputSchema).optional(),
  entries: z.lazy(() => entryTableUpdateManyWithoutRegistrationNestedInputSchema).optional(),
  images: z.lazy(() => imageTableUpdateManyWithoutRegistrationNestedInputSchema).optional()
}).strict();

export const registrationTableUncheckedUpdateInputSchema: z.ZodType<Prisma.registrationTableUncheckedUpdateInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  artistId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  registrationYear: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  closed: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  bumpIn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bumpOut: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  displayRequirements: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accommodation: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  crane: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  transport: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  entries: z.lazy(() => entryTableUncheckedUpdateManyWithoutRegistrationNestedInputSchema).optional(),
  images: z.lazy(() => imageTableUncheckedUpdateManyWithoutRegistrationNestedInputSchema).optional()
}).strict();

export const registrationTableCreateManyInputSchema: z.ZodType<Prisma.registrationTableCreateManyInput> = z.object({
  id: z.number().int().optional(),
  artistId: z.number().int(),
  registrationYear: z.string(),
  closed: z.boolean().optional(),
  bumpIn: z.string().optional().nullable(),
  bumpOut: z.string().optional().nullable(),
  displayRequirements: z.string().optional().nullable(),
  accommodation: z.boolean().optional().nullable(),
  crane: z.boolean().optional().nullable(),
  transport: z.boolean().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const registrationTableUpdateManyMutationInputSchema: z.ZodType<Prisma.registrationTableUpdateManyMutationInput> = z.object({
  registrationYear: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  closed: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  bumpIn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bumpOut: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  displayRequirements: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accommodation: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  crane: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  transport: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const registrationTableUncheckedUpdateManyInputSchema: z.ZodType<Prisma.registrationTableUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  artistId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  registrationYear: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  closed: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  bumpIn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bumpOut: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  displayRequirements: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accommodation: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  crane: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  transport: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const entryTableCreateInputSchema: z.ZodType<Prisma.entryTableCreateInput> = z.object({
  accepted: z.boolean().optional(),
  description: z.string().optional().nullable(),
  dimensions: z.string().optional().nullable(),
  enterMajorPrize: z.boolean().optional(),
  inOrOut: z.lazy(() => EntryTypeSchema).optional().nullable(),
  material: z.string().optional().nullable(),
  price: z.number().int().optional().nullable(),
  specialRequirements: z.string().optional().nullable(),
  title: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  images: z.lazy(() => imageTableCreateNestedManyWithoutEntryInputSchema).optional(),
  artist: z.lazy(() => artistTableCreateNestedOneWithoutEntriesInputSchema),
  registration: z.lazy(() => registrationTableCreateNestedOneWithoutEntriesInputSchema)
}).strict();

export const entryTableUncheckedCreateInputSchema: z.ZodType<Prisma.entryTableUncheckedCreateInput> = z.object({
  id: z.number().int().optional(),
  artistId: z.number().int(),
  accepted: z.boolean().optional(),
  registrationId: z.number().int(),
  description: z.string().optional().nullable(),
  dimensions: z.string().optional().nullable(),
  enterMajorPrize: z.boolean().optional(),
  inOrOut: z.lazy(() => EntryTypeSchema).optional().nullable(),
  material: z.string().optional().nullable(),
  price: z.number().int().optional().nullable(),
  specialRequirements: z.string().optional().nullable(),
  title: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  images: z.lazy(() => imageTableUncheckedCreateNestedManyWithoutEntryInputSchema).optional()
}).strict();

export const entryTableUpdateInputSchema: z.ZodType<Prisma.entryTableUpdateInput> = z.object({
  accepted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  dimensions: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  enterMajorPrize: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  inOrOut: z.union([ z.lazy(() => EntryTypeSchema),z.lazy(() => NullableEnumEntryTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  material: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  price: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  specialRequirements: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  images: z.lazy(() => imageTableUpdateManyWithoutEntryNestedInputSchema).optional(),
  artist: z.lazy(() => artistTableUpdateOneRequiredWithoutEntriesNestedInputSchema).optional(),
  registration: z.lazy(() => registrationTableUpdateOneRequiredWithoutEntriesNestedInputSchema).optional()
}).strict();

export const entryTableUncheckedUpdateInputSchema: z.ZodType<Prisma.entryTableUncheckedUpdateInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  artistId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  accepted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  registrationId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  dimensions: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  enterMajorPrize: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  inOrOut: z.union([ z.lazy(() => EntryTypeSchema),z.lazy(() => NullableEnumEntryTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  material: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  price: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  specialRequirements: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  images: z.lazy(() => imageTableUncheckedUpdateManyWithoutEntryNestedInputSchema).optional()
}).strict();

export const entryTableCreateManyInputSchema: z.ZodType<Prisma.entryTableCreateManyInput> = z.object({
  id: z.number().int().optional(),
  artistId: z.number().int(),
  accepted: z.boolean().optional(),
  registrationId: z.number().int(),
  description: z.string().optional().nullable(),
  dimensions: z.string().optional().nullable(),
  enterMajorPrize: z.boolean().optional(),
  inOrOut: z.lazy(() => EntryTypeSchema).optional().nullable(),
  material: z.string().optional().nullable(),
  price: z.number().int().optional().nullable(),
  specialRequirements: z.string().optional().nullable(),
  title: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const entryTableUpdateManyMutationInputSchema: z.ZodType<Prisma.entryTableUpdateManyMutationInput> = z.object({
  accepted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  dimensions: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  enterMajorPrize: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  inOrOut: z.union([ z.lazy(() => EntryTypeSchema),z.lazy(() => NullableEnumEntryTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  material: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  price: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  specialRequirements: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const entryTableUncheckedUpdateManyInputSchema: z.ZodType<Prisma.entryTableUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  artistId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  accepted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  registrationId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  dimensions: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  enterMajorPrize: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  inOrOut: z.union([ z.lazy(() => EntryTypeSchema),z.lazy(() => NullableEnumEntryTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  material: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  price: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  specialRequirements: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const imageTableCreateInputSchema: z.ZodType<Prisma.imageTableCreateInput> = z.object({
  cloudId: z.string(),
  cloudURL: z.string(),
  originalFileName: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  artist: z.lazy(() => artistTableCreateNestedOneWithoutImagesInputSchema),
  registration: z.lazy(() => registrationTableCreateNestedOneWithoutImagesInputSchema).optional(),
  entry: z.lazy(() => entryTableCreateNestedOneWithoutImagesInputSchema).optional()
}).strict();

export const imageTableUncheckedCreateInputSchema: z.ZodType<Prisma.imageTableUncheckedCreateInput> = z.object({
  id: z.number().int().optional(),
  artistId: z.number().int(),
  registrationId: z.number().int().optional().nullable(),
  entryId: z.number().int().optional().nullable(),
  cloudId: z.string(),
  cloudURL: z.string(),
  originalFileName: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const imageTableUpdateInputSchema: z.ZodType<Prisma.imageTableUpdateInput> = z.object({
  cloudId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  cloudURL: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  originalFileName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  artist: z.lazy(() => artistTableUpdateOneRequiredWithoutImagesNestedInputSchema).optional(),
  registration: z.lazy(() => registrationTableUpdateOneWithoutImagesNestedInputSchema).optional(),
  entry: z.lazy(() => entryTableUpdateOneWithoutImagesNestedInputSchema).optional()
}).strict();

export const imageTableUncheckedUpdateInputSchema: z.ZodType<Prisma.imageTableUncheckedUpdateInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  artistId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  registrationId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  entryId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cloudId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  cloudURL: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  originalFileName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const imageTableCreateManyInputSchema: z.ZodType<Prisma.imageTableCreateManyInput> = z.object({
  id: z.number().int().optional(),
  artistId: z.number().int(),
  registrationId: z.number().int().optional().nullable(),
  entryId: z.number().int().optional().nullable(),
  cloudId: z.string(),
  cloudURL: z.string(),
  originalFileName: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const imageTableUpdateManyMutationInputSchema: z.ZodType<Prisma.imageTableUpdateManyMutationInput> = z.object({
  cloudId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  cloudURL: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  originalFileName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const imageTableUncheckedUpdateManyInputSchema: z.ZodType<Prisma.imageTableUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  artistId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  registrationId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  entryId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cloudId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  cloudURL: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  originalFileName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const IntFilterSchema: z.ZodType<Prisma.IntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const EnumIndigenousFilterSchema: z.ZodType<Prisma.EnumIndigenousFilter> = z.object({
  equals: z.lazy(() => IndigenousSchema).optional(),
  in: z.lazy(() => IndigenousSchema).array().optional(),
  notIn: z.lazy(() => IndigenousSchema).array().optional(),
  not: z.union([ z.lazy(() => IndigenousSchema),z.lazy(() => NestedEnumIndigenousFilterSchema) ]).optional(),
}).strict();

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const DateTimeFilterSchema: z.ZodType<Prisma.DateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const RegistrationTableListRelationFilterSchema: z.ZodType<Prisma.RegistrationTableListRelationFilter> = z.object({
  every: z.lazy(() => registrationTableWhereInputSchema).optional(),
  some: z.lazy(() => registrationTableWhereInputSchema).optional(),
  none: z.lazy(() => registrationTableWhereInputSchema).optional()
}).strict();

export const ImageTableListRelationFilterSchema: z.ZodType<Prisma.ImageTableListRelationFilter> = z.object({
  every: z.lazy(() => imageTableWhereInputSchema).optional(),
  some: z.lazy(() => imageTableWhereInputSchema).optional(),
  none: z.lazy(() => imageTableWhereInputSchema).optional()
}).strict();

export const EntryTableListRelationFilterSchema: z.ZodType<Prisma.EntryTableListRelationFilter> = z.object({
  every: z.lazy(() => entryTableWhereInputSchema).optional(),
  some: z.lazy(() => entryTableWhereInputSchema).optional(),
  none: z.lazy(() => entryTableWhereInputSchema).optional()
}).strict();

export const SortOrderInputSchema: z.ZodType<Prisma.SortOrderInput> = z.object({
  sort: z.lazy(() => SortOrderSchema),
  nulls: z.lazy(() => NullsOrderSchema).optional()
}).strict();

export const registrationTableOrderByRelationAggregateInputSchema: z.ZodType<Prisma.registrationTableOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const imageTableOrderByRelationAggregateInputSchema: z.ZodType<Prisma.imageTableOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const entryTableOrderByRelationAggregateInputSchema: z.ZodType<Prisma.entryTableOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const artistTableCountOrderByAggregateInputSchema: z.ZodType<Prisma.artistTableCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  phone: z.lazy(() => SortOrderSchema).optional(),
  postcode: z.lazy(() => SortOrderSchema).optional(),
  firstNations: z.lazy(() => SortOrderSchema).optional(),
  bankAccountName: z.lazy(() => SortOrderSchema).optional(),
  bankBSB: z.lazy(() => SortOrderSchema).optional(),
  bankAccount: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const artistTableAvgOrderByAggregateInputSchema: z.ZodType<Prisma.artistTableAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const artistTableMaxOrderByAggregateInputSchema: z.ZodType<Prisma.artistTableMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  phone: z.lazy(() => SortOrderSchema).optional(),
  postcode: z.lazy(() => SortOrderSchema).optional(),
  firstNations: z.lazy(() => SortOrderSchema).optional(),
  bankAccountName: z.lazy(() => SortOrderSchema).optional(),
  bankBSB: z.lazy(() => SortOrderSchema).optional(),
  bankAccount: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const artistTableMinOrderByAggregateInputSchema: z.ZodType<Prisma.artistTableMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  phone: z.lazy(() => SortOrderSchema).optional(),
  postcode: z.lazy(() => SortOrderSchema).optional(),
  firstNations: z.lazy(() => SortOrderSchema).optional(),
  bankAccountName: z.lazy(() => SortOrderSchema).optional(),
  bankBSB: z.lazy(() => SortOrderSchema).optional(),
  bankAccount: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const artistTableSumOrderByAggregateInputSchema: z.ZodType<Prisma.artistTableSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const IntWithAggregatesFilterSchema: z.ZodType<Prisma.IntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const EnumIndigenousWithAggregatesFilterSchema: z.ZodType<Prisma.EnumIndigenousWithAggregatesFilter> = z.object({
  equals: z.lazy(() => IndigenousSchema).optional(),
  in: z.lazy(() => IndigenousSchema).array().optional(),
  notIn: z.lazy(() => IndigenousSchema).array().optional(),
  not: z.union([ z.lazy(() => IndigenousSchema),z.lazy(() => NestedEnumIndigenousWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumIndigenousFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumIndigenousFilterSchema).optional()
}).strict();

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const DateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const BoolFilterSchema: z.ZodType<Prisma.BoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict();

export const BoolNullableFilterSchema: z.ZodType<Prisma.BoolNullableFilter> = z.object({
  equals: z.boolean().optional().nullable(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const ArtistTableRelationFilterSchema: z.ZodType<Prisma.ArtistTableRelationFilter> = z.object({
  is: z.lazy(() => artistTableWhereInputSchema).optional(),
  isNot: z.lazy(() => artistTableWhereInputSchema).optional()
}).strict();

export const registrationTableCountOrderByAggregateInputSchema: z.ZodType<Prisma.registrationTableCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  artistId: z.lazy(() => SortOrderSchema).optional(),
  registrationYear: z.lazy(() => SortOrderSchema).optional(),
  closed: z.lazy(() => SortOrderSchema).optional(),
  bumpIn: z.lazy(() => SortOrderSchema).optional(),
  bumpOut: z.lazy(() => SortOrderSchema).optional(),
  displayRequirements: z.lazy(() => SortOrderSchema).optional(),
  accommodation: z.lazy(() => SortOrderSchema).optional(),
  crane: z.lazy(() => SortOrderSchema).optional(),
  transport: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const registrationTableAvgOrderByAggregateInputSchema: z.ZodType<Prisma.registrationTableAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  artistId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const registrationTableMaxOrderByAggregateInputSchema: z.ZodType<Prisma.registrationTableMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  artistId: z.lazy(() => SortOrderSchema).optional(),
  registrationYear: z.lazy(() => SortOrderSchema).optional(),
  closed: z.lazy(() => SortOrderSchema).optional(),
  bumpIn: z.lazy(() => SortOrderSchema).optional(),
  bumpOut: z.lazy(() => SortOrderSchema).optional(),
  displayRequirements: z.lazy(() => SortOrderSchema).optional(),
  accommodation: z.lazy(() => SortOrderSchema).optional(),
  crane: z.lazy(() => SortOrderSchema).optional(),
  transport: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const registrationTableMinOrderByAggregateInputSchema: z.ZodType<Prisma.registrationTableMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  artistId: z.lazy(() => SortOrderSchema).optional(),
  registrationYear: z.lazy(() => SortOrderSchema).optional(),
  closed: z.lazy(() => SortOrderSchema).optional(),
  bumpIn: z.lazy(() => SortOrderSchema).optional(),
  bumpOut: z.lazy(() => SortOrderSchema).optional(),
  displayRequirements: z.lazy(() => SortOrderSchema).optional(),
  accommodation: z.lazy(() => SortOrderSchema).optional(),
  crane: z.lazy(() => SortOrderSchema).optional(),
  transport: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const registrationTableSumOrderByAggregateInputSchema: z.ZodType<Prisma.registrationTableSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  artistId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BoolWithAggregatesFilterSchema: z.ZodType<Prisma.BoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional()
}).strict();

export const BoolNullableWithAggregatesFilterSchema: z.ZodType<Prisma.BoolNullableWithAggregatesFilter> = z.object({
  equals: z.boolean().optional().nullable(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolNullableFilterSchema).optional()
}).strict();

export const EnumEntryTypeNullableFilterSchema: z.ZodType<Prisma.EnumEntryTypeNullableFilter> = z.object({
  equals: z.lazy(() => EntryTypeSchema).optional().nullable(),
  in: z.lazy(() => EntryTypeSchema).array().optional().nullable(),
  notIn: z.lazy(() => EntryTypeSchema).array().optional().nullable(),
  not: z.union([ z.lazy(() => EntryTypeSchema),z.lazy(() => NestedEnumEntryTypeNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const IntNullableFilterSchema: z.ZodType<Prisma.IntNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const RegistrationTableRelationFilterSchema: z.ZodType<Prisma.RegistrationTableRelationFilter> = z.object({
  is: z.lazy(() => registrationTableWhereInputSchema).optional(),
  isNot: z.lazy(() => registrationTableWhereInputSchema).optional()
}).strict();

export const entryTableCountOrderByAggregateInputSchema: z.ZodType<Prisma.entryTableCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  artistId: z.lazy(() => SortOrderSchema).optional(),
  accepted: z.lazy(() => SortOrderSchema).optional(),
  registrationId: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  dimensions: z.lazy(() => SortOrderSchema).optional(),
  enterMajorPrize: z.lazy(() => SortOrderSchema).optional(),
  inOrOut: z.lazy(() => SortOrderSchema).optional(),
  material: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  specialRequirements: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const entryTableAvgOrderByAggregateInputSchema: z.ZodType<Prisma.entryTableAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  artistId: z.lazy(() => SortOrderSchema).optional(),
  registrationId: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const entryTableMaxOrderByAggregateInputSchema: z.ZodType<Prisma.entryTableMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  artistId: z.lazy(() => SortOrderSchema).optional(),
  accepted: z.lazy(() => SortOrderSchema).optional(),
  registrationId: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  dimensions: z.lazy(() => SortOrderSchema).optional(),
  enterMajorPrize: z.lazy(() => SortOrderSchema).optional(),
  inOrOut: z.lazy(() => SortOrderSchema).optional(),
  material: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  specialRequirements: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const entryTableMinOrderByAggregateInputSchema: z.ZodType<Prisma.entryTableMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  artistId: z.lazy(() => SortOrderSchema).optional(),
  accepted: z.lazy(() => SortOrderSchema).optional(),
  registrationId: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  dimensions: z.lazy(() => SortOrderSchema).optional(),
  enterMajorPrize: z.lazy(() => SortOrderSchema).optional(),
  inOrOut: z.lazy(() => SortOrderSchema).optional(),
  material: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  specialRequirements: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const entryTableSumOrderByAggregateInputSchema: z.ZodType<Prisma.entryTableSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  artistId: z.lazy(() => SortOrderSchema).optional(),
  registrationId: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumEntryTypeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.EnumEntryTypeNullableWithAggregatesFilter> = z.object({
  equals: z.lazy(() => EntryTypeSchema).optional().nullable(),
  in: z.lazy(() => EntryTypeSchema).array().optional().nullable(),
  notIn: z.lazy(() => EntryTypeSchema).array().optional().nullable(),
  not: z.union([ z.lazy(() => EntryTypeSchema),z.lazy(() => NestedEnumEntryTypeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumEntryTypeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumEntryTypeNullableFilterSchema).optional()
}).strict();

export const IntNullableWithAggregatesFilterSchema: z.ZodType<Prisma.IntNullableWithAggregatesFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedIntNullableFilterSchema).optional()
}).strict();

export const RegistrationTableNullableRelationFilterSchema: z.ZodType<Prisma.RegistrationTableNullableRelationFilter> = z.object({
  is: z.lazy(() => registrationTableWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => registrationTableWhereInputSchema).optional().nullable()
}).strict();

export const EntryTableNullableRelationFilterSchema: z.ZodType<Prisma.EntryTableNullableRelationFilter> = z.object({
  is: z.lazy(() => entryTableWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => entryTableWhereInputSchema).optional().nullable()
}).strict();

export const imageTableCountOrderByAggregateInputSchema: z.ZodType<Prisma.imageTableCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  artistId: z.lazy(() => SortOrderSchema).optional(),
  registrationId: z.lazy(() => SortOrderSchema).optional(),
  entryId: z.lazy(() => SortOrderSchema).optional(),
  cloudId: z.lazy(() => SortOrderSchema).optional(),
  cloudURL: z.lazy(() => SortOrderSchema).optional(),
  originalFileName: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const imageTableAvgOrderByAggregateInputSchema: z.ZodType<Prisma.imageTableAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  artistId: z.lazy(() => SortOrderSchema).optional(),
  registrationId: z.lazy(() => SortOrderSchema).optional(),
  entryId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const imageTableMaxOrderByAggregateInputSchema: z.ZodType<Prisma.imageTableMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  artistId: z.lazy(() => SortOrderSchema).optional(),
  registrationId: z.lazy(() => SortOrderSchema).optional(),
  entryId: z.lazy(() => SortOrderSchema).optional(),
  cloudId: z.lazy(() => SortOrderSchema).optional(),
  cloudURL: z.lazy(() => SortOrderSchema).optional(),
  originalFileName: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const imageTableMinOrderByAggregateInputSchema: z.ZodType<Prisma.imageTableMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  artistId: z.lazy(() => SortOrderSchema).optional(),
  registrationId: z.lazy(() => SortOrderSchema).optional(),
  entryId: z.lazy(() => SortOrderSchema).optional(),
  cloudId: z.lazy(() => SortOrderSchema).optional(),
  cloudURL: z.lazy(() => SortOrderSchema).optional(),
  originalFileName: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const imageTableSumOrderByAggregateInputSchema: z.ZodType<Prisma.imageTableSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  artistId: z.lazy(() => SortOrderSchema).optional(),
  registrationId: z.lazy(() => SortOrderSchema).optional(),
  entryId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const registrationTableCreateNestedManyWithoutArtistInputSchema: z.ZodType<Prisma.registrationTableCreateNestedManyWithoutArtistInput> = z.object({
  create: z.union([ z.lazy(() => registrationTableCreateWithoutArtistInputSchema),z.lazy(() => registrationTableCreateWithoutArtistInputSchema).array(),z.lazy(() => registrationTableUncheckedCreateWithoutArtistInputSchema),z.lazy(() => registrationTableUncheckedCreateWithoutArtistInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => registrationTableCreateOrConnectWithoutArtistInputSchema),z.lazy(() => registrationTableCreateOrConnectWithoutArtistInputSchema).array() ]).optional(),
  createMany: z.lazy(() => registrationTableCreateManyArtistInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => registrationTableWhereUniqueInputSchema),z.lazy(() => registrationTableWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const imageTableCreateNestedManyWithoutArtistInputSchema: z.ZodType<Prisma.imageTableCreateNestedManyWithoutArtistInput> = z.object({
  create: z.union([ z.lazy(() => imageTableCreateWithoutArtistInputSchema),z.lazy(() => imageTableCreateWithoutArtistInputSchema).array(),z.lazy(() => imageTableUncheckedCreateWithoutArtistInputSchema),z.lazy(() => imageTableUncheckedCreateWithoutArtistInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => imageTableCreateOrConnectWithoutArtistInputSchema),z.lazy(() => imageTableCreateOrConnectWithoutArtistInputSchema).array() ]).optional(),
  createMany: z.lazy(() => imageTableCreateManyArtistInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => imageTableWhereUniqueInputSchema),z.lazy(() => imageTableWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const entryTableCreateNestedManyWithoutArtistInputSchema: z.ZodType<Prisma.entryTableCreateNestedManyWithoutArtistInput> = z.object({
  create: z.union([ z.lazy(() => entryTableCreateWithoutArtistInputSchema),z.lazy(() => entryTableCreateWithoutArtistInputSchema).array(),z.lazy(() => entryTableUncheckedCreateWithoutArtistInputSchema),z.lazy(() => entryTableUncheckedCreateWithoutArtistInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => entryTableCreateOrConnectWithoutArtistInputSchema),z.lazy(() => entryTableCreateOrConnectWithoutArtistInputSchema).array() ]).optional(),
  createMany: z.lazy(() => entryTableCreateManyArtistInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => entryTableWhereUniqueInputSchema),z.lazy(() => entryTableWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const registrationTableUncheckedCreateNestedManyWithoutArtistInputSchema: z.ZodType<Prisma.registrationTableUncheckedCreateNestedManyWithoutArtistInput> = z.object({
  create: z.union([ z.lazy(() => registrationTableCreateWithoutArtistInputSchema),z.lazy(() => registrationTableCreateWithoutArtistInputSchema).array(),z.lazy(() => registrationTableUncheckedCreateWithoutArtistInputSchema),z.lazy(() => registrationTableUncheckedCreateWithoutArtistInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => registrationTableCreateOrConnectWithoutArtistInputSchema),z.lazy(() => registrationTableCreateOrConnectWithoutArtistInputSchema).array() ]).optional(),
  createMany: z.lazy(() => registrationTableCreateManyArtistInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => registrationTableWhereUniqueInputSchema),z.lazy(() => registrationTableWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const imageTableUncheckedCreateNestedManyWithoutArtistInputSchema: z.ZodType<Prisma.imageTableUncheckedCreateNestedManyWithoutArtistInput> = z.object({
  create: z.union([ z.lazy(() => imageTableCreateWithoutArtistInputSchema),z.lazy(() => imageTableCreateWithoutArtistInputSchema).array(),z.lazy(() => imageTableUncheckedCreateWithoutArtistInputSchema),z.lazy(() => imageTableUncheckedCreateWithoutArtistInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => imageTableCreateOrConnectWithoutArtistInputSchema),z.lazy(() => imageTableCreateOrConnectWithoutArtistInputSchema).array() ]).optional(),
  createMany: z.lazy(() => imageTableCreateManyArtistInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => imageTableWhereUniqueInputSchema),z.lazy(() => imageTableWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const entryTableUncheckedCreateNestedManyWithoutArtistInputSchema: z.ZodType<Prisma.entryTableUncheckedCreateNestedManyWithoutArtistInput> = z.object({
  create: z.union([ z.lazy(() => entryTableCreateWithoutArtistInputSchema),z.lazy(() => entryTableCreateWithoutArtistInputSchema).array(),z.lazy(() => entryTableUncheckedCreateWithoutArtistInputSchema),z.lazy(() => entryTableUncheckedCreateWithoutArtistInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => entryTableCreateOrConnectWithoutArtistInputSchema),z.lazy(() => entryTableCreateOrConnectWithoutArtistInputSchema).array() ]).optional(),
  createMany: z.lazy(() => entryTableCreateManyArtistInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => entryTableWhereUniqueInputSchema),z.lazy(() => entryTableWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional()
}).strict();

export const EnumIndigenousFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumIndigenousFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => IndigenousSchema).optional()
}).strict();

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional().nullable()
}).strict();

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> = z.object({
  set: z.coerce.date().optional()
}).strict();

export const registrationTableUpdateManyWithoutArtistNestedInputSchema: z.ZodType<Prisma.registrationTableUpdateManyWithoutArtistNestedInput> = z.object({
  create: z.union([ z.lazy(() => registrationTableCreateWithoutArtistInputSchema),z.lazy(() => registrationTableCreateWithoutArtistInputSchema).array(),z.lazy(() => registrationTableUncheckedCreateWithoutArtistInputSchema),z.lazy(() => registrationTableUncheckedCreateWithoutArtistInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => registrationTableCreateOrConnectWithoutArtistInputSchema),z.lazy(() => registrationTableCreateOrConnectWithoutArtistInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => registrationTableUpsertWithWhereUniqueWithoutArtistInputSchema),z.lazy(() => registrationTableUpsertWithWhereUniqueWithoutArtistInputSchema).array() ]).optional(),
  createMany: z.lazy(() => registrationTableCreateManyArtistInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => registrationTableWhereUniqueInputSchema),z.lazy(() => registrationTableWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => registrationTableWhereUniqueInputSchema),z.lazy(() => registrationTableWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => registrationTableWhereUniqueInputSchema),z.lazy(() => registrationTableWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => registrationTableWhereUniqueInputSchema),z.lazy(() => registrationTableWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => registrationTableUpdateWithWhereUniqueWithoutArtistInputSchema),z.lazy(() => registrationTableUpdateWithWhereUniqueWithoutArtistInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => registrationTableUpdateManyWithWhereWithoutArtistInputSchema),z.lazy(() => registrationTableUpdateManyWithWhereWithoutArtistInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => registrationTableScalarWhereInputSchema),z.lazy(() => registrationTableScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const imageTableUpdateManyWithoutArtistNestedInputSchema: z.ZodType<Prisma.imageTableUpdateManyWithoutArtistNestedInput> = z.object({
  create: z.union([ z.lazy(() => imageTableCreateWithoutArtistInputSchema),z.lazy(() => imageTableCreateWithoutArtistInputSchema).array(),z.lazy(() => imageTableUncheckedCreateWithoutArtistInputSchema),z.lazy(() => imageTableUncheckedCreateWithoutArtistInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => imageTableCreateOrConnectWithoutArtistInputSchema),z.lazy(() => imageTableCreateOrConnectWithoutArtistInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => imageTableUpsertWithWhereUniqueWithoutArtistInputSchema),z.lazy(() => imageTableUpsertWithWhereUniqueWithoutArtistInputSchema).array() ]).optional(),
  createMany: z.lazy(() => imageTableCreateManyArtistInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => imageTableWhereUniqueInputSchema),z.lazy(() => imageTableWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => imageTableWhereUniqueInputSchema),z.lazy(() => imageTableWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => imageTableWhereUniqueInputSchema),z.lazy(() => imageTableWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => imageTableWhereUniqueInputSchema),z.lazy(() => imageTableWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => imageTableUpdateWithWhereUniqueWithoutArtistInputSchema),z.lazy(() => imageTableUpdateWithWhereUniqueWithoutArtistInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => imageTableUpdateManyWithWhereWithoutArtistInputSchema),z.lazy(() => imageTableUpdateManyWithWhereWithoutArtistInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => imageTableScalarWhereInputSchema),z.lazy(() => imageTableScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const entryTableUpdateManyWithoutArtistNestedInputSchema: z.ZodType<Prisma.entryTableUpdateManyWithoutArtistNestedInput> = z.object({
  create: z.union([ z.lazy(() => entryTableCreateWithoutArtistInputSchema),z.lazy(() => entryTableCreateWithoutArtistInputSchema).array(),z.lazy(() => entryTableUncheckedCreateWithoutArtistInputSchema),z.lazy(() => entryTableUncheckedCreateWithoutArtistInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => entryTableCreateOrConnectWithoutArtistInputSchema),z.lazy(() => entryTableCreateOrConnectWithoutArtistInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => entryTableUpsertWithWhereUniqueWithoutArtistInputSchema),z.lazy(() => entryTableUpsertWithWhereUniqueWithoutArtistInputSchema).array() ]).optional(),
  createMany: z.lazy(() => entryTableCreateManyArtistInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => entryTableWhereUniqueInputSchema),z.lazy(() => entryTableWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => entryTableWhereUniqueInputSchema),z.lazy(() => entryTableWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => entryTableWhereUniqueInputSchema),z.lazy(() => entryTableWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => entryTableWhereUniqueInputSchema),z.lazy(() => entryTableWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => entryTableUpdateWithWhereUniqueWithoutArtistInputSchema),z.lazy(() => entryTableUpdateWithWhereUniqueWithoutArtistInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => entryTableUpdateManyWithWhereWithoutArtistInputSchema),z.lazy(() => entryTableUpdateManyWithWhereWithoutArtistInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => entryTableScalarWhereInputSchema),z.lazy(() => entryTableScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const IntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> = z.object({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();

export const registrationTableUncheckedUpdateManyWithoutArtistNestedInputSchema: z.ZodType<Prisma.registrationTableUncheckedUpdateManyWithoutArtistNestedInput> = z.object({
  create: z.union([ z.lazy(() => registrationTableCreateWithoutArtistInputSchema),z.lazy(() => registrationTableCreateWithoutArtistInputSchema).array(),z.lazy(() => registrationTableUncheckedCreateWithoutArtistInputSchema),z.lazy(() => registrationTableUncheckedCreateWithoutArtistInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => registrationTableCreateOrConnectWithoutArtistInputSchema),z.lazy(() => registrationTableCreateOrConnectWithoutArtistInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => registrationTableUpsertWithWhereUniqueWithoutArtistInputSchema),z.lazy(() => registrationTableUpsertWithWhereUniqueWithoutArtistInputSchema).array() ]).optional(),
  createMany: z.lazy(() => registrationTableCreateManyArtistInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => registrationTableWhereUniqueInputSchema),z.lazy(() => registrationTableWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => registrationTableWhereUniqueInputSchema),z.lazy(() => registrationTableWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => registrationTableWhereUniqueInputSchema),z.lazy(() => registrationTableWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => registrationTableWhereUniqueInputSchema),z.lazy(() => registrationTableWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => registrationTableUpdateWithWhereUniqueWithoutArtistInputSchema),z.lazy(() => registrationTableUpdateWithWhereUniqueWithoutArtistInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => registrationTableUpdateManyWithWhereWithoutArtistInputSchema),z.lazy(() => registrationTableUpdateManyWithWhereWithoutArtistInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => registrationTableScalarWhereInputSchema),z.lazy(() => registrationTableScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const imageTableUncheckedUpdateManyWithoutArtistNestedInputSchema: z.ZodType<Prisma.imageTableUncheckedUpdateManyWithoutArtistNestedInput> = z.object({
  create: z.union([ z.lazy(() => imageTableCreateWithoutArtistInputSchema),z.lazy(() => imageTableCreateWithoutArtistInputSchema).array(),z.lazy(() => imageTableUncheckedCreateWithoutArtistInputSchema),z.lazy(() => imageTableUncheckedCreateWithoutArtistInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => imageTableCreateOrConnectWithoutArtistInputSchema),z.lazy(() => imageTableCreateOrConnectWithoutArtistInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => imageTableUpsertWithWhereUniqueWithoutArtistInputSchema),z.lazy(() => imageTableUpsertWithWhereUniqueWithoutArtistInputSchema).array() ]).optional(),
  createMany: z.lazy(() => imageTableCreateManyArtistInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => imageTableWhereUniqueInputSchema),z.lazy(() => imageTableWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => imageTableWhereUniqueInputSchema),z.lazy(() => imageTableWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => imageTableWhereUniqueInputSchema),z.lazy(() => imageTableWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => imageTableWhereUniqueInputSchema),z.lazy(() => imageTableWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => imageTableUpdateWithWhereUniqueWithoutArtistInputSchema),z.lazy(() => imageTableUpdateWithWhereUniqueWithoutArtistInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => imageTableUpdateManyWithWhereWithoutArtistInputSchema),z.lazy(() => imageTableUpdateManyWithWhereWithoutArtistInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => imageTableScalarWhereInputSchema),z.lazy(() => imageTableScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const entryTableUncheckedUpdateManyWithoutArtistNestedInputSchema: z.ZodType<Prisma.entryTableUncheckedUpdateManyWithoutArtistNestedInput> = z.object({
  create: z.union([ z.lazy(() => entryTableCreateWithoutArtistInputSchema),z.lazy(() => entryTableCreateWithoutArtistInputSchema).array(),z.lazy(() => entryTableUncheckedCreateWithoutArtistInputSchema),z.lazy(() => entryTableUncheckedCreateWithoutArtistInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => entryTableCreateOrConnectWithoutArtistInputSchema),z.lazy(() => entryTableCreateOrConnectWithoutArtistInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => entryTableUpsertWithWhereUniqueWithoutArtistInputSchema),z.lazy(() => entryTableUpsertWithWhereUniqueWithoutArtistInputSchema).array() ]).optional(),
  createMany: z.lazy(() => entryTableCreateManyArtistInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => entryTableWhereUniqueInputSchema),z.lazy(() => entryTableWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => entryTableWhereUniqueInputSchema),z.lazy(() => entryTableWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => entryTableWhereUniqueInputSchema),z.lazy(() => entryTableWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => entryTableWhereUniqueInputSchema),z.lazy(() => entryTableWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => entryTableUpdateWithWhereUniqueWithoutArtistInputSchema),z.lazy(() => entryTableUpdateWithWhereUniqueWithoutArtistInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => entryTableUpdateManyWithWhereWithoutArtistInputSchema),z.lazy(() => entryTableUpdateManyWithWhereWithoutArtistInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => entryTableScalarWhereInputSchema),z.lazy(() => entryTableScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const artistTableCreateNestedOneWithoutRegistrationsInputSchema: z.ZodType<Prisma.artistTableCreateNestedOneWithoutRegistrationsInput> = z.object({
  create: z.union([ z.lazy(() => artistTableCreateWithoutRegistrationsInputSchema),z.lazy(() => artistTableUncheckedCreateWithoutRegistrationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => artistTableCreateOrConnectWithoutRegistrationsInputSchema).optional(),
  connect: z.lazy(() => artistTableWhereUniqueInputSchema).optional()
}).strict();

export const entryTableCreateNestedManyWithoutRegistrationInputSchema: z.ZodType<Prisma.entryTableCreateNestedManyWithoutRegistrationInput> = z.object({
  create: z.union([ z.lazy(() => entryTableCreateWithoutRegistrationInputSchema),z.lazy(() => entryTableCreateWithoutRegistrationInputSchema).array(),z.lazy(() => entryTableUncheckedCreateWithoutRegistrationInputSchema),z.lazy(() => entryTableUncheckedCreateWithoutRegistrationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => entryTableCreateOrConnectWithoutRegistrationInputSchema),z.lazy(() => entryTableCreateOrConnectWithoutRegistrationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => entryTableCreateManyRegistrationInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => entryTableWhereUniqueInputSchema),z.lazy(() => entryTableWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const imageTableCreateNestedManyWithoutRegistrationInputSchema: z.ZodType<Prisma.imageTableCreateNestedManyWithoutRegistrationInput> = z.object({
  create: z.union([ z.lazy(() => imageTableCreateWithoutRegistrationInputSchema),z.lazy(() => imageTableCreateWithoutRegistrationInputSchema).array(),z.lazy(() => imageTableUncheckedCreateWithoutRegistrationInputSchema),z.lazy(() => imageTableUncheckedCreateWithoutRegistrationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => imageTableCreateOrConnectWithoutRegistrationInputSchema),z.lazy(() => imageTableCreateOrConnectWithoutRegistrationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => imageTableCreateManyRegistrationInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => imageTableWhereUniqueInputSchema),z.lazy(() => imageTableWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const entryTableUncheckedCreateNestedManyWithoutRegistrationInputSchema: z.ZodType<Prisma.entryTableUncheckedCreateNestedManyWithoutRegistrationInput> = z.object({
  create: z.union([ z.lazy(() => entryTableCreateWithoutRegistrationInputSchema),z.lazy(() => entryTableCreateWithoutRegistrationInputSchema).array(),z.lazy(() => entryTableUncheckedCreateWithoutRegistrationInputSchema),z.lazy(() => entryTableUncheckedCreateWithoutRegistrationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => entryTableCreateOrConnectWithoutRegistrationInputSchema),z.lazy(() => entryTableCreateOrConnectWithoutRegistrationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => entryTableCreateManyRegistrationInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => entryTableWhereUniqueInputSchema),z.lazy(() => entryTableWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const imageTableUncheckedCreateNestedManyWithoutRegistrationInputSchema: z.ZodType<Prisma.imageTableUncheckedCreateNestedManyWithoutRegistrationInput> = z.object({
  create: z.union([ z.lazy(() => imageTableCreateWithoutRegistrationInputSchema),z.lazy(() => imageTableCreateWithoutRegistrationInputSchema).array(),z.lazy(() => imageTableUncheckedCreateWithoutRegistrationInputSchema),z.lazy(() => imageTableUncheckedCreateWithoutRegistrationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => imageTableCreateOrConnectWithoutRegistrationInputSchema),z.lazy(() => imageTableCreateOrConnectWithoutRegistrationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => imageTableCreateManyRegistrationInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => imageTableWhereUniqueInputSchema),z.lazy(() => imageTableWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const BoolFieldUpdateOperationsInputSchema: z.ZodType<Prisma.BoolFieldUpdateOperationsInput> = z.object({
  set: z.boolean().optional()
}).strict();

export const NullableBoolFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableBoolFieldUpdateOperationsInput> = z.object({
  set: z.boolean().optional().nullable()
}).strict();

export const artistTableUpdateOneRequiredWithoutRegistrationsNestedInputSchema: z.ZodType<Prisma.artistTableUpdateOneRequiredWithoutRegistrationsNestedInput> = z.object({
  create: z.union([ z.lazy(() => artistTableCreateWithoutRegistrationsInputSchema),z.lazy(() => artistTableUncheckedCreateWithoutRegistrationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => artistTableCreateOrConnectWithoutRegistrationsInputSchema).optional(),
  upsert: z.lazy(() => artistTableUpsertWithoutRegistrationsInputSchema).optional(),
  connect: z.lazy(() => artistTableWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => artistTableUpdateToOneWithWhereWithoutRegistrationsInputSchema),z.lazy(() => artistTableUpdateWithoutRegistrationsInputSchema),z.lazy(() => artistTableUncheckedUpdateWithoutRegistrationsInputSchema) ]).optional(),
}).strict();

export const entryTableUpdateManyWithoutRegistrationNestedInputSchema: z.ZodType<Prisma.entryTableUpdateManyWithoutRegistrationNestedInput> = z.object({
  create: z.union([ z.lazy(() => entryTableCreateWithoutRegistrationInputSchema),z.lazy(() => entryTableCreateWithoutRegistrationInputSchema).array(),z.lazy(() => entryTableUncheckedCreateWithoutRegistrationInputSchema),z.lazy(() => entryTableUncheckedCreateWithoutRegistrationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => entryTableCreateOrConnectWithoutRegistrationInputSchema),z.lazy(() => entryTableCreateOrConnectWithoutRegistrationInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => entryTableUpsertWithWhereUniqueWithoutRegistrationInputSchema),z.lazy(() => entryTableUpsertWithWhereUniqueWithoutRegistrationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => entryTableCreateManyRegistrationInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => entryTableWhereUniqueInputSchema),z.lazy(() => entryTableWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => entryTableWhereUniqueInputSchema),z.lazy(() => entryTableWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => entryTableWhereUniqueInputSchema),z.lazy(() => entryTableWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => entryTableWhereUniqueInputSchema),z.lazy(() => entryTableWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => entryTableUpdateWithWhereUniqueWithoutRegistrationInputSchema),z.lazy(() => entryTableUpdateWithWhereUniqueWithoutRegistrationInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => entryTableUpdateManyWithWhereWithoutRegistrationInputSchema),z.lazy(() => entryTableUpdateManyWithWhereWithoutRegistrationInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => entryTableScalarWhereInputSchema),z.lazy(() => entryTableScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const imageTableUpdateManyWithoutRegistrationNestedInputSchema: z.ZodType<Prisma.imageTableUpdateManyWithoutRegistrationNestedInput> = z.object({
  create: z.union([ z.lazy(() => imageTableCreateWithoutRegistrationInputSchema),z.lazy(() => imageTableCreateWithoutRegistrationInputSchema).array(),z.lazy(() => imageTableUncheckedCreateWithoutRegistrationInputSchema),z.lazy(() => imageTableUncheckedCreateWithoutRegistrationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => imageTableCreateOrConnectWithoutRegistrationInputSchema),z.lazy(() => imageTableCreateOrConnectWithoutRegistrationInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => imageTableUpsertWithWhereUniqueWithoutRegistrationInputSchema),z.lazy(() => imageTableUpsertWithWhereUniqueWithoutRegistrationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => imageTableCreateManyRegistrationInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => imageTableWhereUniqueInputSchema),z.lazy(() => imageTableWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => imageTableWhereUniqueInputSchema),z.lazy(() => imageTableWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => imageTableWhereUniqueInputSchema),z.lazy(() => imageTableWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => imageTableWhereUniqueInputSchema),z.lazy(() => imageTableWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => imageTableUpdateWithWhereUniqueWithoutRegistrationInputSchema),z.lazy(() => imageTableUpdateWithWhereUniqueWithoutRegistrationInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => imageTableUpdateManyWithWhereWithoutRegistrationInputSchema),z.lazy(() => imageTableUpdateManyWithWhereWithoutRegistrationInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => imageTableScalarWhereInputSchema),z.lazy(() => imageTableScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const entryTableUncheckedUpdateManyWithoutRegistrationNestedInputSchema: z.ZodType<Prisma.entryTableUncheckedUpdateManyWithoutRegistrationNestedInput> = z.object({
  create: z.union([ z.lazy(() => entryTableCreateWithoutRegistrationInputSchema),z.lazy(() => entryTableCreateWithoutRegistrationInputSchema).array(),z.lazy(() => entryTableUncheckedCreateWithoutRegistrationInputSchema),z.lazy(() => entryTableUncheckedCreateWithoutRegistrationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => entryTableCreateOrConnectWithoutRegistrationInputSchema),z.lazy(() => entryTableCreateOrConnectWithoutRegistrationInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => entryTableUpsertWithWhereUniqueWithoutRegistrationInputSchema),z.lazy(() => entryTableUpsertWithWhereUniqueWithoutRegistrationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => entryTableCreateManyRegistrationInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => entryTableWhereUniqueInputSchema),z.lazy(() => entryTableWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => entryTableWhereUniqueInputSchema),z.lazy(() => entryTableWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => entryTableWhereUniqueInputSchema),z.lazy(() => entryTableWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => entryTableWhereUniqueInputSchema),z.lazy(() => entryTableWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => entryTableUpdateWithWhereUniqueWithoutRegistrationInputSchema),z.lazy(() => entryTableUpdateWithWhereUniqueWithoutRegistrationInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => entryTableUpdateManyWithWhereWithoutRegistrationInputSchema),z.lazy(() => entryTableUpdateManyWithWhereWithoutRegistrationInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => entryTableScalarWhereInputSchema),z.lazy(() => entryTableScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const imageTableUncheckedUpdateManyWithoutRegistrationNestedInputSchema: z.ZodType<Prisma.imageTableUncheckedUpdateManyWithoutRegistrationNestedInput> = z.object({
  create: z.union([ z.lazy(() => imageTableCreateWithoutRegistrationInputSchema),z.lazy(() => imageTableCreateWithoutRegistrationInputSchema).array(),z.lazy(() => imageTableUncheckedCreateWithoutRegistrationInputSchema),z.lazy(() => imageTableUncheckedCreateWithoutRegistrationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => imageTableCreateOrConnectWithoutRegistrationInputSchema),z.lazy(() => imageTableCreateOrConnectWithoutRegistrationInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => imageTableUpsertWithWhereUniqueWithoutRegistrationInputSchema),z.lazy(() => imageTableUpsertWithWhereUniqueWithoutRegistrationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => imageTableCreateManyRegistrationInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => imageTableWhereUniqueInputSchema),z.lazy(() => imageTableWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => imageTableWhereUniqueInputSchema),z.lazy(() => imageTableWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => imageTableWhereUniqueInputSchema),z.lazy(() => imageTableWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => imageTableWhereUniqueInputSchema),z.lazy(() => imageTableWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => imageTableUpdateWithWhereUniqueWithoutRegistrationInputSchema),z.lazy(() => imageTableUpdateWithWhereUniqueWithoutRegistrationInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => imageTableUpdateManyWithWhereWithoutRegistrationInputSchema),z.lazy(() => imageTableUpdateManyWithWhereWithoutRegistrationInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => imageTableScalarWhereInputSchema),z.lazy(() => imageTableScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const imageTableCreateNestedManyWithoutEntryInputSchema: z.ZodType<Prisma.imageTableCreateNestedManyWithoutEntryInput> = z.object({
  create: z.union([ z.lazy(() => imageTableCreateWithoutEntryInputSchema),z.lazy(() => imageTableCreateWithoutEntryInputSchema).array(),z.lazy(() => imageTableUncheckedCreateWithoutEntryInputSchema),z.lazy(() => imageTableUncheckedCreateWithoutEntryInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => imageTableCreateOrConnectWithoutEntryInputSchema),z.lazy(() => imageTableCreateOrConnectWithoutEntryInputSchema).array() ]).optional(),
  createMany: z.lazy(() => imageTableCreateManyEntryInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => imageTableWhereUniqueInputSchema),z.lazy(() => imageTableWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const artistTableCreateNestedOneWithoutEntriesInputSchema: z.ZodType<Prisma.artistTableCreateNestedOneWithoutEntriesInput> = z.object({
  create: z.union([ z.lazy(() => artistTableCreateWithoutEntriesInputSchema),z.lazy(() => artistTableUncheckedCreateWithoutEntriesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => artistTableCreateOrConnectWithoutEntriesInputSchema).optional(),
  connect: z.lazy(() => artistTableWhereUniqueInputSchema).optional()
}).strict();

export const registrationTableCreateNestedOneWithoutEntriesInputSchema: z.ZodType<Prisma.registrationTableCreateNestedOneWithoutEntriesInput> = z.object({
  create: z.union([ z.lazy(() => registrationTableCreateWithoutEntriesInputSchema),z.lazy(() => registrationTableUncheckedCreateWithoutEntriesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => registrationTableCreateOrConnectWithoutEntriesInputSchema).optional(),
  connect: z.lazy(() => registrationTableWhereUniqueInputSchema).optional()
}).strict();

export const imageTableUncheckedCreateNestedManyWithoutEntryInputSchema: z.ZodType<Prisma.imageTableUncheckedCreateNestedManyWithoutEntryInput> = z.object({
  create: z.union([ z.lazy(() => imageTableCreateWithoutEntryInputSchema),z.lazy(() => imageTableCreateWithoutEntryInputSchema).array(),z.lazy(() => imageTableUncheckedCreateWithoutEntryInputSchema),z.lazy(() => imageTableUncheckedCreateWithoutEntryInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => imageTableCreateOrConnectWithoutEntryInputSchema),z.lazy(() => imageTableCreateOrConnectWithoutEntryInputSchema).array() ]).optional(),
  createMany: z.lazy(() => imageTableCreateManyEntryInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => imageTableWhereUniqueInputSchema),z.lazy(() => imageTableWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const NullableEnumEntryTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableEnumEntryTypeFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => EntryTypeSchema).optional().nullable()
}).strict();

export const NullableIntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableIntFieldUpdateOperationsInput> = z.object({
  set: z.number().optional().nullable(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();

export const imageTableUpdateManyWithoutEntryNestedInputSchema: z.ZodType<Prisma.imageTableUpdateManyWithoutEntryNestedInput> = z.object({
  create: z.union([ z.lazy(() => imageTableCreateWithoutEntryInputSchema),z.lazy(() => imageTableCreateWithoutEntryInputSchema).array(),z.lazy(() => imageTableUncheckedCreateWithoutEntryInputSchema),z.lazy(() => imageTableUncheckedCreateWithoutEntryInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => imageTableCreateOrConnectWithoutEntryInputSchema),z.lazy(() => imageTableCreateOrConnectWithoutEntryInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => imageTableUpsertWithWhereUniqueWithoutEntryInputSchema),z.lazy(() => imageTableUpsertWithWhereUniqueWithoutEntryInputSchema).array() ]).optional(),
  createMany: z.lazy(() => imageTableCreateManyEntryInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => imageTableWhereUniqueInputSchema),z.lazy(() => imageTableWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => imageTableWhereUniqueInputSchema),z.lazy(() => imageTableWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => imageTableWhereUniqueInputSchema),z.lazy(() => imageTableWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => imageTableWhereUniqueInputSchema),z.lazy(() => imageTableWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => imageTableUpdateWithWhereUniqueWithoutEntryInputSchema),z.lazy(() => imageTableUpdateWithWhereUniqueWithoutEntryInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => imageTableUpdateManyWithWhereWithoutEntryInputSchema),z.lazy(() => imageTableUpdateManyWithWhereWithoutEntryInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => imageTableScalarWhereInputSchema),z.lazy(() => imageTableScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const artistTableUpdateOneRequiredWithoutEntriesNestedInputSchema: z.ZodType<Prisma.artistTableUpdateOneRequiredWithoutEntriesNestedInput> = z.object({
  create: z.union([ z.lazy(() => artistTableCreateWithoutEntriesInputSchema),z.lazy(() => artistTableUncheckedCreateWithoutEntriesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => artistTableCreateOrConnectWithoutEntriesInputSchema).optional(),
  upsert: z.lazy(() => artistTableUpsertWithoutEntriesInputSchema).optional(),
  connect: z.lazy(() => artistTableWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => artistTableUpdateToOneWithWhereWithoutEntriesInputSchema),z.lazy(() => artistTableUpdateWithoutEntriesInputSchema),z.lazy(() => artistTableUncheckedUpdateWithoutEntriesInputSchema) ]).optional(),
}).strict();

export const registrationTableUpdateOneRequiredWithoutEntriesNestedInputSchema: z.ZodType<Prisma.registrationTableUpdateOneRequiredWithoutEntriesNestedInput> = z.object({
  create: z.union([ z.lazy(() => registrationTableCreateWithoutEntriesInputSchema),z.lazy(() => registrationTableUncheckedCreateWithoutEntriesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => registrationTableCreateOrConnectWithoutEntriesInputSchema).optional(),
  upsert: z.lazy(() => registrationTableUpsertWithoutEntriesInputSchema).optional(),
  connect: z.lazy(() => registrationTableWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => registrationTableUpdateToOneWithWhereWithoutEntriesInputSchema),z.lazy(() => registrationTableUpdateWithoutEntriesInputSchema),z.lazy(() => registrationTableUncheckedUpdateWithoutEntriesInputSchema) ]).optional(),
}).strict();

export const imageTableUncheckedUpdateManyWithoutEntryNestedInputSchema: z.ZodType<Prisma.imageTableUncheckedUpdateManyWithoutEntryNestedInput> = z.object({
  create: z.union([ z.lazy(() => imageTableCreateWithoutEntryInputSchema),z.lazy(() => imageTableCreateWithoutEntryInputSchema).array(),z.lazy(() => imageTableUncheckedCreateWithoutEntryInputSchema),z.lazy(() => imageTableUncheckedCreateWithoutEntryInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => imageTableCreateOrConnectWithoutEntryInputSchema),z.lazy(() => imageTableCreateOrConnectWithoutEntryInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => imageTableUpsertWithWhereUniqueWithoutEntryInputSchema),z.lazy(() => imageTableUpsertWithWhereUniqueWithoutEntryInputSchema).array() ]).optional(),
  createMany: z.lazy(() => imageTableCreateManyEntryInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => imageTableWhereUniqueInputSchema),z.lazy(() => imageTableWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => imageTableWhereUniqueInputSchema),z.lazy(() => imageTableWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => imageTableWhereUniqueInputSchema),z.lazy(() => imageTableWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => imageTableWhereUniqueInputSchema),z.lazy(() => imageTableWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => imageTableUpdateWithWhereUniqueWithoutEntryInputSchema),z.lazy(() => imageTableUpdateWithWhereUniqueWithoutEntryInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => imageTableUpdateManyWithWhereWithoutEntryInputSchema),z.lazy(() => imageTableUpdateManyWithWhereWithoutEntryInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => imageTableScalarWhereInputSchema),z.lazy(() => imageTableScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const artistTableCreateNestedOneWithoutImagesInputSchema: z.ZodType<Prisma.artistTableCreateNestedOneWithoutImagesInput> = z.object({
  create: z.union([ z.lazy(() => artistTableCreateWithoutImagesInputSchema),z.lazy(() => artistTableUncheckedCreateWithoutImagesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => artistTableCreateOrConnectWithoutImagesInputSchema).optional(),
  connect: z.lazy(() => artistTableWhereUniqueInputSchema).optional()
}).strict();

export const registrationTableCreateNestedOneWithoutImagesInputSchema: z.ZodType<Prisma.registrationTableCreateNestedOneWithoutImagesInput> = z.object({
  create: z.union([ z.lazy(() => registrationTableCreateWithoutImagesInputSchema),z.lazy(() => registrationTableUncheckedCreateWithoutImagesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => registrationTableCreateOrConnectWithoutImagesInputSchema).optional(),
  connect: z.lazy(() => registrationTableWhereUniqueInputSchema).optional()
}).strict();

export const entryTableCreateNestedOneWithoutImagesInputSchema: z.ZodType<Prisma.entryTableCreateNestedOneWithoutImagesInput> = z.object({
  create: z.union([ z.lazy(() => entryTableCreateWithoutImagesInputSchema),z.lazy(() => entryTableUncheckedCreateWithoutImagesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => entryTableCreateOrConnectWithoutImagesInputSchema).optional(),
  connect: z.lazy(() => entryTableWhereUniqueInputSchema).optional()
}).strict();

export const artistTableUpdateOneRequiredWithoutImagesNestedInputSchema: z.ZodType<Prisma.artistTableUpdateOneRequiredWithoutImagesNestedInput> = z.object({
  create: z.union([ z.lazy(() => artistTableCreateWithoutImagesInputSchema),z.lazy(() => artistTableUncheckedCreateWithoutImagesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => artistTableCreateOrConnectWithoutImagesInputSchema).optional(),
  upsert: z.lazy(() => artistTableUpsertWithoutImagesInputSchema).optional(),
  connect: z.lazy(() => artistTableWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => artistTableUpdateToOneWithWhereWithoutImagesInputSchema),z.lazy(() => artistTableUpdateWithoutImagesInputSchema),z.lazy(() => artistTableUncheckedUpdateWithoutImagesInputSchema) ]).optional(),
}).strict();

export const registrationTableUpdateOneWithoutImagesNestedInputSchema: z.ZodType<Prisma.registrationTableUpdateOneWithoutImagesNestedInput> = z.object({
  create: z.union([ z.lazy(() => registrationTableCreateWithoutImagesInputSchema),z.lazy(() => registrationTableUncheckedCreateWithoutImagesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => registrationTableCreateOrConnectWithoutImagesInputSchema).optional(),
  upsert: z.lazy(() => registrationTableUpsertWithoutImagesInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => registrationTableWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => registrationTableWhereInputSchema) ]).optional(),
  connect: z.lazy(() => registrationTableWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => registrationTableUpdateToOneWithWhereWithoutImagesInputSchema),z.lazy(() => registrationTableUpdateWithoutImagesInputSchema),z.lazy(() => registrationTableUncheckedUpdateWithoutImagesInputSchema) ]).optional(),
}).strict();

export const entryTableUpdateOneWithoutImagesNestedInputSchema: z.ZodType<Prisma.entryTableUpdateOneWithoutImagesNestedInput> = z.object({
  create: z.union([ z.lazy(() => entryTableCreateWithoutImagesInputSchema),z.lazy(() => entryTableUncheckedCreateWithoutImagesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => entryTableCreateOrConnectWithoutImagesInputSchema).optional(),
  upsert: z.lazy(() => entryTableUpsertWithoutImagesInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => entryTableWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => entryTableWhereInputSchema) ]).optional(),
  connect: z.lazy(() => entryTableWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => entryTableUpdateToOneWithWhereWithoutImagesInputSchema),z.lazy(() => entryTableUpdateWithoutImagesInputSchema),z.lazy(() => entryTableUncheckedUpdateWithoutImagesInputSchema) ]).optional(),
}).strict();

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const NestedEnumIndigenousFilterSchema: z.ZodType<Prisma.NestedEnumIndigenousFilter> = z.object({
  equals: z.lazy(() => IndigenousSchema).optional(),
  in: z.lazy(() => IndigenousSchema).array().optional(),
  notIn: z.lazy(() => IndigenousSchema).array().optional(),
  not: z.union([ z.lazy(() => IndigenousSchema),z.lazy(() => NestedEnumIndigenousFilterSchema) ]).optional(),
}).strict();

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedDateTimeFilterSchema: z.ZodType<Prisma.NestedDateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const NestedIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
}).strict();

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const NestedEnumIndigenousWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumIndigenousWithAggregatesFilter> = z.object({
  equals: z.lazy(() => IndigenousSchema).optional(),
  in: z.lazy(() => IndigenousSchema).array().optional(),
  notIn: z.lazy(() => IndigenousSchema).array().optional(),
  not: z.union([ z.lazy(() => IndigenousSchema),z.lazy(() => NestedEnumIndigenousWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumIndigenousFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumIndigenousFilterSchema).optional()
}).strict();

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedDateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const NestedBoolFilterSchema: z.ZodType<Prisma.NestedBoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict();

export const NestedBoolNullableFilterSchema: z.ZodType<Prisma.NestedBoolNullableFilter> = z.object({
  equals: z.boolean().optional().nullable(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedBoolWithAggregatesFilterSchema: z.ZodType<Prisma.NestedBoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional()
}).strict();

export const NestedBoolNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedBoolNullableWithAggregatesFilter> = z.object({
  equals: z.boolean().optional().nullable(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolNullableFilterSchema).optional()
}).strict();

export const NestedEnumEntryTypeNullableFilterSchema: z.ZodType<Prisma.NestedEnumEntryTypeNullableFilter> = z.object({
  equals: z.lazy(() => EntryTypeSchema).optional().nullable(),
  in: z.lazy(() => EntryTypeSchema).array().optional().nullable(),
  notIn: z.lazy(() => EntryTypeSchema).array().optional().nullable(),
  not: z.union([ z.lazy(() => EntryTypeSchema),z.lazy(() => NestedEnumEntryTypeNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedEnumEntryTypeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumEntryTypeNullableWithAggregatesFilter> = z.object({
  equals: z.lazy(() => EntryTypeSchema).optional().nullable(),
  in: z.lazy(() => EntryTypeSchema).array().optional().nullable(),
  notIn: z.lazy(() => EntryTypeSchema).array().optional().nullable(),
  not: z.union([ z.lazy(() => EntryTypeSchema),z.lazy(() => NestedEnumEntryTypeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumEntryTypeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumEntryTypeNullableFilterSchema).optional()
}).strict();

export const NestedIntNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntNullableWithAggregatesFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedIntNullableFilterSchema).optional()
}).strict();

export const NestedFloatNullableFilterSchema: z.ZodType<Prisma.NestedFloatNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const registrationTableCreateWithoutArtistInputSchema: z.ZodType<Prisma.registrationTableCreateWithoutArtistInput> = z.object({
  registrationYear: z.string(),
  closed: z.boolean().optional(),
  bumpIn: z.string().optional().nullable(),
  bumpOut: z.string().optional().nullable(),
  displayRequirements: z.string().optional().nullable(),
  accommodation: z.boolean().optional().nullable(),
  crane: z.boolean().optional().nullable(),
  transport: z.boolean().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  entries: z.lazy(() => entryTableCreateNestedManyWithoutRegistrationInputSchema).optional(),
  images: z.lazy(() => imageTableCreateNestedManyWithoutRegistrationInputSchema).optional()
}).strict();

export const registrationTableUncheckedCreateWithoutArtistInputSchema: z.ZodType<Prisma.registrationTableUncheckedCreateWithoutArtistInput> = z.object({
  id: z.number().int().optional(),
  registrationYear: z.string(),
  closed: z.boolean().optional(),
  bumpIn: z.string().optional().nullable(),
  bumpOut: z.string().optional().nullable(),
  displayRequirements: z.string().optional().nullable(),
  accommodation: z.boolean().optional().nullable(),
  crane: z.boolean().optional().nullable(),
  transport: z.boolean().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  entries: z.lazy(() => entryTableUncheckedCreateNestedManyWithoutRegistrationInputSchema).optional(),
  images: z.lazy(() => imageTableUncheckedCreateNestedManyWithoutRegistrationInputSchema).optional()
}).strict();

export const registrationTableCreateOrConnectWithoutArtistInputSchema: z.ZodType<Prisma.registrationTableCreateOrConnectWithoutArtistInput> = z.object({
  where: z.lazy(() => registrationTableWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => registrationTableCreateWithoutArtistInputSchema),z.lazy(() => registrationTableUncheckedCreateWithoutArtistInputSchema) ]),
}).strict();

export const registrationTableCreateManyArtistInputEnvelopeSchema: z.ZodType<Prisma.registrationTableCreateManyArtistInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => registrationTableCreateManyArtistInputSchema),z.lazy(() => registrationTableCreateManyArtistInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const imageTableCreateWithoutArtistInputSchema: z.ZodType<Prisma.imageTableCreateWithoutArtistInput> = z.object({
  cloudId: z.string(),
  cloudURL: z.string(),
  originalFileName: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  registration: z.lazy(() => registrationTableCreateNestedOneWithoutImagesInputSchema).optional(),
  entry: z.lazy(() => entryTableCreateNestedOneWithoutImagesInputSchema).optional()
}).strict();

export const imageTableUncheckedCreateWithoutArtistInputSchema: z.ZodType<Prisma.imageTableUncheckedCreateWithoutArtistInput> = z.object({
  id: z.number().int().optional(),
  registrationId: z.number().int().optional().nullable(),
  entryId: z.number().int().optional().nullable(),
  cloudId: z.string(),
  cloudURL: z.string(),
  originalFileName: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const imageTableCreateOrConnectWithoutArtistInputSchema: z.ZodType<Prisma.imageTableCreateOrConnectWithoutArtistInput> = z.object({
  where: z.lazy(() => imageTableWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => imageTableCreateWithoutArtistInputSchema),z.lazy(() => imageTableUncheckedCreateWithoutArtistInputSchema) ]),
}).strict();

export const imageTableCreateManyArtistInputEnvelopeSchema: z.ZodType<Prisma.imageTableCreateManyArtistInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => imageTableCreateManyArtistInputSchema),z.lazy(() => imageTableCreateManyArtistInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const entryTableCreateWithoutArtistInputSchema: z.ZodType<Prisma.entryTableCreateWithoutArtistInput> = z.object({
  accepted: z.boolean().optional(),
  description: z.string().optional().nullable(),
  dimensions: z.string().optional().nullable(),
  enterMajorPrize: z.boolean().optional(),
  inOrOut: z.lazy(() => EntryTypeSchema).optional().nullable(),
  material: z.string().optional().nullable(),
  price: z.number().int().optional().nullable(),
  specialRequirements: z.string().optional().nullable(),
  title: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  images: z.lazy(() => imageTableCreateNestedManyWithoutEntryInputSchema).optional(),
  registration: z.lazy(() => registrationTableCreateNestedOneWithoutEntriesInputSchema)
}).strict();

export const entryTableUncheckedCreateWithoutArtistInputSchema: z.ZodType<Prisma.entryTableUncheckedCreateWithoutArtistInput> = z.object({
  id: z.number().int().optional(),
  accepted: z.boolean().optional(),
  registrationId: z.number().int(),
  description: z.string().optional().nullable(),
  dimensions: z.string().optional().nullable(),
  enterMajorPrize: z.boolean().optional(),
  inOrOut: z.lazy(() => EntryTypeSchema).optional().nullable(),
  material: z.string().optional().nullable(),
  price: z.number().int().optional().nullable(),
  specialRequirements: z.string().optional().nullable(),
  title: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  images: z.lazy(() => imageTableUncheckedCreateNestedManyWithoutEntryInputSchema).optional()
}).strict();

export const entryTableCreateOrConnectWithoutArtistInputSchema: z.ZodType<Prisma.entryTableCreateOrConnectWithoutArtistInput> = z.object({
  where: z.lazy(() => entryTableWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => entryTableCreateWithoutArtistInputSchema),z.lazy(() => entryTableUncheckedCreateWithoutArtistInputSchema) ]),
}).strict();

export const entryTableCreateManyArtistInputEnvelopeSchema: z.ZodType<Prisma.entryTableCreateManyArtistInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => entryTableCreateManyArtistInputSchema),z.lazy(() => entryTableCreateManyArtistInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const registrationTableUpsertWithWhereUniqueWithoutArtistInputSchema: z.ZodType<Prisma.registrationTableUpsertWithWhereUniqueWithoutArtistInput> = z.object({
  where: z.lazy(() => registrationTableWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => registrationTableUpdateWithoutArtistInputSchema),z.lazy(() => registrationTableUncheckedUpdateWithoutArtistInputSchema) ]),
  create: z.union([ z.lazy(() => registrationTableCreateWithoutArtistInputSchema),z.lazy(() => registrationTableUncheckedCreateWithoutArtistInputSchema) ]),
}).strict();

export const registrationTableUpdateWithWhereUniqueWithoutArtistInputSchema: z.ZodType<Prisma.registrationTableUpdateWithWhereUniqueWithoutArtistInput> = z.object({
  where: z.lazy(() => registrationTableWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => registrationTableUpdateWithoutArtistInputSchema),z.lazy(() => registrationTableUncheckedUpdateWithoutArtistInputSchema) ]),
}).strict();

export const registrationTableUpdateManyWithWhereWithoutArtistInputSchema: z.ZodType<Prisma.registrationTableUpdateManyWithWhereWithoutArtistInput> = z.object({
  where: z.lazy(() => registrationTableScalarWhereInputSchema),
  data: z.union([ z.lazy(() => registrationTableUpdateManyMutationInputSchema),z.lazy(() => registrationTableUncheckedUpdateManyWithoutArtistInputSchema) ]),
}).strict();

export const registrationTableScalarWhereInputSchema: z.ZodType<Prisma.registrationTableScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => registrationTableScalarWhereInputSchema),z.lazy(() => registrationTableScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => registrationTableScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => registrationTableScalarWhereInputSchema),z.lazy(() => registrationTableScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  artistId: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  registrationYear: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  closed: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  bumpIn: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  bumpOut: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  displayRequirements: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  accommodation: z.union([ z.lazy(() => BoolNullableFilterSchema),z.boolean() ]).optional().nullable(),
  crane: z.union([ z.lazy(() => BoolNullableFilterSchema),z.boolean() ]).optional().nullable(),
  transport: z.union([ z.lazy(() => BoolNullableFilterSchema),z.boolean() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const imageTableUpsertWithWhereUniqueWithoutArtistInputSchema: z.ZodType<Prisma.imageTableUpsertWithWhereUniqueWithoutArtistInput> = z.object({
  where: z.lazy(() => imageTableWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => imageTableUpdateWithoutArtistInputSchema),z.lazy(() => imageTableUncheckedUpdateWithoutArtistInputSchema) ]),
  create: z.union([ z.lazy(() => imageTableCreateWithoutArtistInputSchema),z.lazy(() => imageTableUncheckedCreateWithoutArtistInputSchema) ]),
}).strict();

export const imageTableUpdateWithWhereUniqueWithoutArtistInputSchema: z.ZodType<Prisma.imageTableUpdateWithWhereUniqueWithoutArtistInput> = z.object({
  where: z.lazy(() => imageTableWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => imageTableUpdateWithoutArtistInputSchema),z.lazy(() => imageTableUncheckedUpdateWithoutArtistInputSchema) ]),
}).strict();

export const imageTableUpdateManyWithWhereWithoutArtistInputSchema: z.ZodType<Prisma.imageTableUpdateManyWithWhereWithoutArtistInput> = z.object({
  where: z.lazy(() => imageTableScalarWhereInputSchema),
  data: z.union([ z.lazy(() => imageTableUpdateManyMutationInputSchema),z.lazy(() => imageTableUncheckedUpdateManyWithoutArtistInputSchema) ]),
}).strict();

export const imageTableScalarWhereInputSchema: z.ZodType<Prisma.imageTableScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => imageTableScalarWhereInputSchema),z.lazy(() => imageTableScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => imageTableScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => imageTableScalarWhereInputSchema),z.lazy(() => imageTableScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  artistId: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  registrationId: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  entryId: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  cloudId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  cloudURL: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  originalFileName: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const entryTableUpsertWithWhereUniqueWithoutArtistInputSchema: z.ZodType<Prisma.entryTableUpsertWithWhereUniqueWithoutArtistInput> = z.object({
  where: z.lazy(() => entryTableWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => entryTableUpdateWithoutArtistInputSchema),z.lazy(() => entryTableUncheckedUpdateWithoutArtistInputSchema) ]),
  create: z.union([ z.lazy(() => entryTableCreateWithoutArtistInputSchema),z.lazy(() => entryTableUncheckedCreateWithoutArtistInputSchema) ]),
}).strict();

export const entryTableUpdateWithWhereUniqueWithoutArtistInputSchema: z.ZodType<Prisma.entryTableUpdateWithWhereUniqueWithoutArtistInput> = z.object({
  where: z.lazy(() => entryTableWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => entryTableUpdateWithoutArtistInputSchema),z.lazy(() => entryTableUncheckedUpdateWithoutArtistInputSchema) ]),
}).strict();

export const entryTableUpdateManyWithWhereWithoutArtistInputSchema: z.ZodType<Prisma.entryTableUpdateManyWithWhereWithoutArtistInput> = z.object({
  where: z.lazy(() => entryTableScalarWhereInputSchema),
  data: z.union([ z.lazy(() => entryTableUpdateManyMutationInputSchema),z.lazy(() => entryTableUncheckedUpdateManyWithoutArtistInputSchema) ]),
}).strict();

export const entryTableScalarWhereInputSchema: z.ZodType<Prisma.entryTableScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => entryTableScalarWhereInputSchema),z.lazy(() => entryTableScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => entryTableScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => entryTableScalarWhereInputSchema),z.lazy(() => entryTableScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  artistId: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  accepted: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  registrationId: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  dimensions: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  enterMajorPrize: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  inOrOut: z.union([ z.lazy(() => EnumEntryTypeNullableFilterSchema),z.lazy(() => EntryTypeSchema) ]).optional().nullable(),
  material: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  price: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  specialRequirements: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  title: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const artistTableCreateWithoutRegistrationsInputSchema: z.ZodType<Prisma.artistTableCreateWithoutRegistrationsInput> = z.object({
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  postcode: z.string(),
  firstNations: z.lazy(() => IndigenousSchema).optional(),
  bankAccountName: z.string().optional().nullable(),
  bankBSB: z.string().optional().nullable(),
  bankAccount: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  images: z.lazy(() => imageTableCreateNestedManyWithoutArtistInputSchema).optional(),
  entries: z.lazy(() => entryTableCreateNestedManyWithoutArtistInputSchema).optional()
}).strict();

export const artistTableUncheckedCreateWithoutRegistrationsInputSchema: z.ZodType<Prisma.artistTableUncheckedCreateWithoutRegistrationsInput> = z.object({
  id: z.number().int().optional(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  postcode: z.string(),
  firstNations: z.lazy(() => IndigenousSchema).optional(),
  bankAccountName: z.string().optional().nullable(),
  bankBSB: z.string().optional().nullable(),
  bankAccount: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  images: z.lazy(() => imageTableUncheckedCreateNestedManyWithoutArtistInputSchema).optional(),
  entries: z.lazy(() => entryTableUncheckedCreateNestedManyWithoutArtistInputSchema).optional()
}).strict();

export const artistTableCreateOrConnectWithoutRegistrationsInputSchema: z.ZodType<Prisma.artistTableCreateOrConnectWithoutRegistrationsInput> = z.object({
  where: z.lazy(() => artistTableWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => artistTableCreateWithoutRegistrationsInputSchema),z.lazy(() => artistTableUncheckedCreateWithoutRegistrationsInputSchema) ]),
}).strict();

export const entryTableCreateWithoutRegistrationInputSchema: z.ZodType<Prisma.entryTableCreateWithoutRegistrationInput> = z.object({
  accepted: z.boolean().optional(),
  description: z.string().optional().nullable(),
  dimensions: z.string().optional().nullable(),
  enterMajorPrize: z.boolean().optional(),
  inOrOut: z.lazy(() => EntryTypeSchema).optional().nullable(),
  material: z.string().optional().nullable(),
  price: z.number().int().optional().nullable(),
  specialRequirements: z.string().optional().nullable(),
  title: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  images: z.lazy(() => imageTableCreateNestedManyWithoutEntryInputSchema).optional(),
  artist: z.lazy(() => artistTableCreateNestedOneWithoutEntriesInputSchema)
}).strict();

export const entryTableUncheckedCreateWithoutRegistrationInputSchema: z.ZodType<Prisma.entryTableUncheckedCreateWithoutRegistrationInput> = z.object({
  id: z.number().int().optional(),
  artistId: z.number().int(),
  accepted: z.boolean().optional(),
  description: z.string().optional().nullable(),
  dimensions: z.string().optional().nullable(),
  enterMajorPrize: z.boolean().optional(),
  inOrOut: z.lazy(() => EntryTypeSchema).optional().nullable(),
  material: z.string().optional().nullable(),
  price: z.number().int().optional().nullable(),
  specialRequirements: z.string().optional().nullable(),
  title: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  images: z.lazy(() => imageTableUncheckedCreateNestedManyWithoutEntryInputSchema).optional()
}).strict();

export const entryTableCreateOrConnectWithoutRegistrationInputSchema: z.ZodType<Prisma.entryTableCreateOrConnectWithoutRegistrationInput> = z.object({
  where: z.lazy(() => entryTableWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => entryTableCreateWithoutRegistrationInputSchema),z.lazy(() => entryTableUncheckedCreateWithoutRegistrationInputSchema) ]),
}).strict();

export const entryTableCreateManyRegistrationInputEnvelopeSchema: z.ZodType<Prisma.entryTableCreateManyRegistrationInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => entryTableCreateManyRegistrationInputSchema),z.lazy(() => entryTableCreateManyRegistrationInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const imageTableCreateWithoutRegistrationInputSchema: z.ZodType<Prisma.imageTableCreateWithoutRegistrationInput> = z.object({
  cloudId: z.string(),
  cloudURL: z.string(),
  originalFileName: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  artist: z.lazy(() => artistTableCreateNestedOneWithoutImagesInputSchema),
  entry: z.lazy(() => entryTableCreateNestedOneWithoutImagesInputSchema).optional()
}).strict();

export const imageTableUncheckedCreateWithoutRegistrationInputSchema: z.ZodType<Prisma.imageTableUncheckedCreateWithoutRegistrationInput> = z.object({
  id: z.number().int().optional(),
  artistId: z.number().int(),
  entryId: z.number().int().optional().nullable(),
  cloudId: z.string(),
  cloudURL: z.string(),
  originalFileName: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const imageTableCreateOrConnectWithoutRegistrationInputSchema: z.ZodType<Prisma.imageTableCreateOrConnectWithoutRegistrationInput> = z.object({
  where: z.lazy(() => imageTableWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => imageTableCreateWithoutRegistrationInputSchema),z.lazy(() => imageTableUncheckedCreateWithoutRegistrationInputSchema) ]),
}).strict();

export const imageTableCreateManyRegistrationInputEnvelopeSchema: z.ZodType<Prisma.imageTableCreateManyRegistrationInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => imageTableCreateManyRegistrationInputSchema),z.lazy(() => imageTableCreateManyRegistrationInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const artistTableUpsertWithoutRegistrationsInputSchema: z.ZodType<Prisma.artistTableUpsertWithoutRegistrationsInput> = z.object({
  update: z.union([ z.lazy(() => artistTableUpdateWithoutRegistrationsInputSchema),z.lazy(() => artistTableUncheckedUpdateWithoutRegistrationsInputSchema) ]),
  create: z.union([ z.lazy(() => artistTableCreateWithoutRegistrationsInputSchema),z.lazy(() => artistTableUncheckedCreateWithoutRegistrationsInputSchema) ]),
  where: z.lazy(() => artistTableWhereInputSchema).optional()
}).strict();

export const artistTableUpdateToOneWithWhereWithoutRegistrationsInputSchema: z.ZodType<Prisma.artistTableUpdateToOneWithWhereWithoutRegistrationsInput> = z.object({
  where: z.lazy(() => artistTableWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => artistTableUpdateWithoutRegistrationsInputSchema),z.lazy(() => artistTableUncheckedUpdateWithoutRegistrationsInputSchema) ]),
}).strict();

export const artistTableUpdateWithoutRegistrationsInputSchema: z.ZodType<Prisma.artistTableUpdateWithoutRegistrationsInput> = z.object({
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  postcode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstNations: z.union([ z.lazy(() => IndigenousSchema),z.lazy(() => EnumIndigenousFieldUpdateOperationsInputSchema) ]).optional(),
  bankAccountName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bankBSB: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bankAccount: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  images: z.lazy(() => imageTableUpdateManyWithoutArtistNestedInputSchema).optional(),
  entries: z.lazy(() => entryTableUpdateManyWithoutArtistNestedInputSchema).optional()
}).strict();

export const artistTableUncheckedUpdateWithoutRegistrationsInputSchema: z.ZodType<Prisma.artistTableUncheckedUpdateWithoutRegistrationsInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  postcode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstNations: z.union([ z.lazy(() => IndigenousSchema),z.lazy(() => EnumIndigenousFieldUpdateOperationsInputSchema) ]).optional(),
  bankAccountName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bankBSB: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bankAccount: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  images: z.lazy(() => imageTableUncheckedUpdateManyWithoutArtistNestedInputSchema).optional(),
  entries: z.lazy(() => entryTableUncheckedUpdateManyWithoutArtistNestedInputSchema).optional()
}).strict();

export const entryTableUpsertWithWhereUniqueWithoutRegistrationInputSchema: z.ZodType<Prisma.entryTableUpsertWithWhereUniqueWithoutRegistrationInput> = z.object({
  where: z.lazy(() => entryTableWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => entryTableUpdateWithoutRegistrationInputSchema),z.lazy(() => entryTableUncheckedUpdateWithoutRegistrationInputSchema) ]),
  create: z.union([ z.lazy(() => entryTableCreateWithoutRegistrationInputSchema),z.lazy(() => entryTableUncheckedCreateWithoutRegistrationInputSchema) ]),
}).strict();

export const entryTableUpdateWithWhereUniqueWithoutRegistrationInputSchema: z.ZodType<Prisma.entryTableUpdateWithWhereUniqueWithoutRegistrationInput> = z.object({
  where: z.lazy(() => entryTableWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => entryTableUpdateWithoutRegistrationInputSchema),z.lazy(() => entryTableUncheckedUpdateWithoutRegistrationInputSchema) ]),
}).strict();

export const entryTableUpdateManyWithWhereWithoutRegistrationInputSchema: z.ZodType<Prisma.entryTableUpdateManyWithWhereWithoutRegistrationInput> = z.object({
  where: z.lazy(() => entryTableScalarWhereInputSchema),
  data: z.union([ z.lazy(() => entryTableUpdateManyMutationInputSchema),z.lazy(() => entryTableUncheckedUpdateManyWithoutRegistrationInputSchema) ]),
}).strict();

export const imageTableUpsertWithWhereUniqueWithoutRegistrationInputSchema: z.ZodType<Prisma.imageTableUpsertWithWhereUniqueWithoutRegistrationInput> = z.object({
  where: z.lazy(() => imageTableWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => imageTableUpdateWithoutRegistrationInputSchema),z.lazy(() => imageTableUncheckedUpdateWithoutRegistrationInputSchema) ]),
  create: z.union([ z.lazy(() => imageTableCreateWithoutRegistrationInputSchema),z.lazy(() => imageTableUncheckedCreateWithoutRegistrationInputSchema) ]),
}).strict();

export const imageTableUpdateWithWhereUniqueWithoutRegistrationInputSchema: z.ZodType<Prisma.imageTableUpdateWithWhereUniqueWithoutRegistrationInput> = z.object({
  where: z.lazy(() => imageTableWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => imageTableUpdateWithoutRegistrationInputSchema),z.lazy(() => imageTableUncheckedUpdateWithoutRegistrationInputSchema) ]),
}).strict();

export const imageTableUpdateManyWithWhereWithoutRegistrationInputSchema: z.ZodType<Prisma.imageTableUpdateManyWithWhereWithoutRegistrationInput> = z.object({
  where: z.lazy(() => imageTableScalarWhereInputSchema),
  data: z.union([ z.lazy(() => imageTableUpdateManyMutationInputSchema),z.lazy(() => imageTableUncheckedUpdateManyWithoutRegistrationInputSchema) ]),
}).strict();

export const imageTableCreateWithoutEntryInputSchema: z.ZodType<Prisma.imageTableCreateWithoutEntryInput> = z.object({
  cloudId: z.string(),
  cloudURL: z.string(),
  originalFileName: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  artist: z.lazy(() => artistTableCreateNestedOneWithoutImagesInputSchema),
  registration: z.lazy(() => registrationTableCreateNestedOneWithoutImagesInputSchema).optional()
}).strict();

export const imageTableUncheckedCreateWithoutEntryInputSchema: z.ZodType<Prisma.imageTableUncheckedCreateWithoutEntryInput> = z.object({
  id: z.number().int().optional(),
  artistId: z.number().int(),
  registrationId: z.number().int().optional().nullable(),
  cloudId: z.string(),
  cloudURL: z.string(),
  originalFileName: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const imageTableCreateOrConnectWithoutEntryInputSchema: z.ZodType<Prisma.imageTableCreateOrConnectWithoutEntryInput> = z.object({
  where: z.lazy(() => imageTableWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => imageTableCreateWithoutEntryInputSchema),z.lazy(() => imageTableUncheckedCreateWithoutEntryInputSchema) ]),
}).strict();

export const imageTableCreateManyEntryInputEnvelopeSchema: z.ZodType<Prisma.imageTableCreateManyEntryInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => imageTableCreateManyEntryInputSchema),z.lazy(() => imageTableCreateManyEntryInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const artistTableCreateWithoutEntriesInputSchema: z.ZodType<Prisma.artistTableCreateWithoutEntriesInput> = z.object({
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  postcode: z.string(),
  firstNations: z.lazy(() => IndigenousSchema).optional(),
  bankAccountName: z.string().optional().nullable(),
  bankBSB: z.string().optional().nullable(),
  bankAccount: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  registrations: z.lazy(() => registrationTableCreateNestedManyWithoutArtistInputSchema).optional(),
  images: z.lazy(() => imageTableCreateNestedManyWithoutArtistInputSchema).optional()
}).strict();

export const artistTableUncheckedCreateWithoutEntriesInputSchema: z.ZodType<Prisma.artistTableUncheckedCreateWithoutEntriesInput> = z.object({
  id: z.number().int().optional(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  postcode: z.string(),
  firstNations: z.lazy(() => IndigenousSchema).optional(),
  bankAccountName: z.string().optional().nullable(),
  bankBSB: z.string().optional().nullable(),
  bankAccount: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  registrations: z.lazy(() => registrationTableUncheckedCreateNestedManyWithoutArtistInputSchema).optional(),
  images: z.lazy(() => imageTableUncheckedCreateNestedManyWithoutArtistInputSchema).optional()
}).strict();

export const artistTableCreateOrConnectWithoutEntriesInputSchema: z.ZodType<Prisma.artistTableCreateOrConnectWithoutEntriesInput> = z.object({
  where: z.lazy(() => artistTableWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => artistTableCreateWithoutEntriesInputSchema),z.lazy(() => artistTableUncheckedCreateWithoutEntriesInputSchema) ]),
}).strict();

export const registrationTableCreateWithoutEntriesInputSchema: z.ZodType<Prisma.registrationTableCreateWithoutEntriesInput> = z.object({
  registrationYear: z.string(),
  closed: z.boolean().optional(),
  bumpIn: z.string().optional().nullable(),
  bumpOut: z.string().optional().nullable(),
  displayRequirements: z.string().optional().nullable(),
  accommodation: z.boolean().optional().nullable(),
  crane: z.boolean().optional().nullable(),
  transport: z.boolean().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  artist: z.lazy(() => artistTableCreateNestedOneWithoutRegistrationsInputSchema),
  images: z.lazy(() => imageTableCreateNestedManyWithoutRegistrationInputSchema).optional()
}).strict();

export const registrationTableUncheckedCreateWithoutEntriesInputSchema: z.ZodType<Prisma.registrationTableUncheckedCreateWithoutEntriesInput> = z.object({
  id: z.number().int().optional(),
  artistId: z.number().int(),
  registrationYear: z.string(),
  closed: z.boolean().optional(),
  bumpIn: z.string().optional().nullable(),
  bumpOut: z.string().optional().nullable(),
  displayRequirements: z.string().optional().nullable(),
  accommodation: z.boolean().optional().nullable(),
  crane: z.boolean().optional().nullable(),
  transport: z.boolean().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  images: z.lazy(() => imageTableUncheckedCreateNestedManyWithoutRegistrationInputSchema).optional()
}).strict();

export const registrationTableCreateOrConnectWithoutEntriesInputSchema: z.ZodType<Prisma.registrationTableCreateOrConnectWithoutEntriesInput> = z.object({
  where: z.lazy(() => registrationTableWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => registrationTableCreateWithoutEntriesInputSchema),z.lazy(() => registrationTableUncheckedCreateWithoutEntriesInputSchema) ]),
}).strict();

export const imageTableUpsertWithWhereUniqueWithoutEntryInputSchema: z.ZodType<Prisma.imageTableUpsertWithWhereUniqueWithoutEntryInput> = z.object({
  where: z.lazy(() => imageTableWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => imageTableUpdateWithoutEntryInputSchema),z.lazy(() => imageTableUncheckedUpdateWithoutEntryInputSchema) ]),
  create: z.union([ z.lazy(() => imageTableCreateWithoutEntryInputSchema),z.lazy(() => imageTableUncheckedCreateWithoutEntryInputSchema) ]),
}).strict();

export const imageTableUpdateWithWhereUniqueWithoutEntryInputSchema: z.ZodType<Prisma.imageTableUpdateWithWhereUniqueWithoutEntryInput> = z.object({
  where: z.lazy(() => imageTableWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => imageTableUpdateWithoutEntryInputSchema),z.lazy(() => imageTableUncheckedUpdateWithoutEntryInputSchema) ]),
}).strict();

export const imageTableUpdateManyWithWhereWithoutEntryInputSchema: z.ZodType<Prisma.imageTableUpdateManyWithWhereWithoutEntryInput> = z.object({
  where: z.lazy(() => imageTableScalarWhereInputSchema),
  data: z.union([ z.lazy(() => imageTableUpdateManyMutationInputSchema),z.lazy(() => imageTableUncheckedUpdateManyWithoutEntryInputSchema) ]),
}).strict();

export const artistTableUpsertWithoutEntriesInputSchema: z.ZodType<Prisma.artistTableUpsertWithoutEntriesInput> = z.object({
  update: z.union([ z.lazy(() => artistTableUpdateWithoutEntriesInputSchema),z.lazy(() => artistTableUncheckedUpdateWithoutEntriesInputSchema) ]),
  create: z.union([ z.lazy(() => artistTableCreateWithoutEntriesInputSchema),z.lazy(() => artistTableUncheckedCreateWithoutEntriesInputSchema) ]),
  where: z.lazy(() => artistTableWhereInputSchema).optional()
}).strict();

export const artistTableUpdateToOneWithWhereWithoutEntriesInputSchema: z.ZodType<Prisma.artistTableUpdateToOneWithWhereWithoutEntriesInput> = z.object({
  where: z.lazy(() => artistTableWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => artistTableUpdateWithoutEntriesInputSchema),z.lazy(() => artistTableUncheckedUpdateWithoutEntriesInputSchema) ]),
}).strict();

export const artistTableUpdateWithoutEntriesInputSchema: z.ZodType<Prisma.artistTableUpdateWithoutEntriesInput> = z.object({
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  postcode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstNations: z.union([ z.lazy(() => IndigenousSchema),z.lazy(() => EnumIndigenousFieldUpdateOperationsInputSchema) ]).optional(),
  bankAccountName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bankBSB: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bankAccount: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  registrations: z.lazy(() => registrationTableUpdateManyWithoutArtistNestedInputSchema).optional(),
  images: z.lazy(() => imageTableUpdateManyWithoutArtistNestedInputSchema).optional()
}).strict();

export const artistTableUncheckedUpdateWithoutEntriesInputSchema: z.ZodType<Prisma.artistTableUncheckedUpdateWithoutEntriesInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  postcode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstNations: z.union([ z.lazy(() => IndigenousSchema),z.lazy(() => EnumIndigenousFieldUpdateOperationsInputSchema) ]).optional(),
  bankAccountName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bankBSB: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bankAccount: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  registrations: z.lazy(() => registrationTableUncheckedUpdateManyWithoutArtistNestedInputSchema).optional(),
  images: z.lazy(() => imageTableUncheckedUpdateManyWithoutArtistNestedInputSchema).optional()
}).strict();

export const registrationTableUpsertWithoutEntriesInputSchema: z.ZodType<Prisma.registrationTableUpsertWithoutEntriesInput> = z.object({
  update: z.union([ z.lazy(() => registrationTableUpdateWithoutEntriesInputSchema),z.lazy(() => registrationTableUncheckedUpdateWithoutEntriesInputSchema) ]),
  create: z.union([ z.lazy(() => registrationTableCreateWithoutEntriesInputSchema),z.lazy(() => registrationTableUncheckedCreateWithoutEntriesInputSchema) ]),
  where: z.lazy(() => registrationTableWhereInputSchema).optional()
}).strict();

export const registrationTableUpdateToOneWithWhereWithoutEntriesInputSchema: z.ZodType<Prisma.registrationTableUpdateToOneWithWhereWithoutEntriesInput> = z.object({
  where: z.lazy(() => registrationTableWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => registrationTableUpdateWithoutEntriesInputSchema),z.lazy(() => registrationTableUncheckedUpdateWithoutEntriesInputSchema) ]),
}).strict();

export const registrationTableUpdateWithoutEntriesInputSchema: z.ZodType<Prisma.registrationTableUpdateWithoutEntriesInput> = z.object({
  registrationYear: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  closed: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  bumpIn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bumpOut: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  displayRequirements: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accommodation: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  crane: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  transport: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  artist: z.lazy(() => artistTableUpdateOneRequiredWithoutRegistrationsNestedInputSchema).optional(),
  images: z.lazy(() => imageTableUpdateManyWithoutRegistrationNestedInputSchema).optional()
}).strict();

export const registrationTableUncheckedUpdateWithoutEntriesInputSchema: z.ZodType<Prisma.registrationTableUncheckedUpdateWithoutEntriesInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  artistId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  registrationYear: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  closed: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  bumpIn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bumpOut: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  displayRequirements: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accommodation: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  crane: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  transport: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  images: z.lazy(() => imageTableUncheckedUpdateManyWithoutRegistrationNestedInputSchema).optional()
}).strict();

export const artistTableCreateWithoutImagesInputSchema: z.ZodType<Prisma.artistTableCreateWithoutImagesInput> = z.object({
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  postcode: z.string(),
  firstNations: z.lazy(() => IndigenousSchema).optional(),
  bankAccountName: z.string().optional().nullable(),
  bankBSB: z.string().optional().nullable(),
  bankAccount: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  registrations: z.lazy(() => registrationTableCreateNestedManyWithoutArtistInputSchema).optional(),
  entries: z.lazy(() => entryTableCreateNestedManyWithoutArtistInputSchema).optional()
}).strict();

export const artistTableUncheckedCreateWithoutImagesInputSchema: z.ZodType<Prisma.artistTableUncheckedCreateWithoutImagesInput> = z.object({
  id: z.number().int().optional(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  postcode: z.string(),
  firstNations: z.lazy(() => IndigenousSchema).optional(),
  bankAccountName: z.string().optional().nullable(),
  bankBSB: z.string().optional().nullable(),
  bankAccount: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  registrations: z.lazy(() => registrationTableUncheckedCreateNestedManyWithoutArtistInputSchema).optional(),
  entries: z.lazy(() => entryTableUncheckedCreateNestedManyWithoutArtistInputSchema).optional()
}).strict();

export const artistTableCreateOrConnectWithoutImagesInputSchema: z.ZodType<Prisma.artistTableCreateOrConnectWithoutImagesInput> = z.object({
  where: z.lazy(() => artistTableWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => artistTableCreateWithoutImagesInputSchema),z.lazy(() => artistTableUncheckedCreateWithoutImagesInputSchema) ]),
}).strict();

export const registrationTableCreateWithoutImagesInputSchema: z.ZodType<Prisma.registrationTableCreateWithoutImagesInput> = z.object({
  registrationYear: z.string(),
  closed: z.boolean().optional(),
  bumpIn: z.string().optional().nullable(),
  bumpOut: z.string().optional().nullable(),
  displayRequirements: z.string().optional().nullable(),
  accommodation: z.boolean().optional().nullable(),
  crane: z.boolean().optional().nullable(),
  transport: z.boolean().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  artist: z.lazy(() => artistTableCreateNestedOneWithoutRegistrationsInputSchema),
  entries: z.lazy(() => entryTableCreateNestedManyWithoutRegistrationInputSchema).optional()
}).strict();

export const registrationTableUncheckedCreateWithoutImagesInputSchema: z.ZodType<Prisma.registrationTableUncheckedCreateWithoutImagesInput> = z.object({
  id: z.number().int().optional(),
  artistId: z.number().int(),
  registrationYear: z.string(),
  closed: z.boolean().optional(),
  bumpIn: z.string().optional().nullable(),
  bumpOut: z.string().optional().nullable(),
  displayRequirements: z.string().optional().nullable(),
  accommodation: z.boolean().optional().nullable(),
  crane: z.boolean().optional().nullable(),
  transport: z.boolean().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  entries: z.lazy(() => entryTableUncheckedCreateNestedManyWithoutRegistrationInputSchema).optional()
}).strict();

export const registrationTableCreateOrConnectWithoutImagesInputSchema: z.ZodType<Prisma.registrationTableCreateOrConnectWithoutImagesInput> = z.object({
  where: z.lazy(() => registrationTableWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => registrationTableCreateWithoutImagesInputSchema),z.lazy(() => registrationTableUncheckedCreateWithoutImagesInputSchema) ]),
}).strict();

export const entryTableCreateWithoutImagesInputSchema: z.ZodType<Prisma.entryTableCreateWithoutImagesInput> = z.object({
  accepted: z.boolean().optional(),
  description: z.string().optional().nullable(),
  dimensions: z.string().optional().nullable(),
  enterMajorPrize: z.boolean().optional(),
  inOrOut: z.lazy(() => EntryTypeSchema).optional().nullable(),
  material: z.string().optional().nullable(),
  price: z.number().int().optional().nullable(),
  specialRequirements: z.string().optional().nullable(),
  title: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  artist: z.lazy(() => artistTableCreateNestedOneWithoutEntriesInputSchema),
  registration: z.lazy(() => registrationTableCreateNestedOneWithoutEntriesInputSchema)
}).strict();

export const entryTableUncheckedCreateWithoutImagesInputSchema: z.ZodType<Prisma.entryTableUncheckedCreateWithoutImagesInput> = z.object({
  id: z.number().int().optional(),
  artistId: z.number().int(),
  accepted: z.boolean().optional(),
  registrationId: z.number().int(),
  description: z.string().optional().nullable(),
  dimensions: z.string().optional().nullable(),
  enterMajorPrize: z.boolean().optional(),
  inOrOut: z.lazy(() => EntryTypeSchema).optional().nullable(),
  material: z.string().optional().nullable(),
  price: z.number().int().optional().nullable(),
  specialRequirements: z.string().optional().nullable(),
  title: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const entryTableCreateOrConnectWithoutImagesInputSchema: z.ZodType<Prisma.entryTableCreateOrConnectWithoutImagesInput> = z.object({
  where: z.lazy(() => entryTableWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => entryTableCreateWithoutImagesInputSchema),z.lazy(() => entryTableUncheckedCreateWithoutImagesInputSchema) ]),
}).strict();

export const artistTableUpsertWithoutImagesInputSchema: z.ZodType<Prisma.artistTableUpsertWithoutImagesInput> = z.object({
  update: z.union([ z.lazy(() => artistTableUpdateWithoutImagesInputSchema),z.lazy(() => artistTableUncheckedUpdateWithoutImagesInputSchema) ]),
  create: z.union([ z.lazy(() => artistTableCreateWithoutImagesInputSchema),z.lazy(() => artistTableUncheckedCreateWithoutImagesInputSchema) ]),
  where: z.lazy(() => artistTableWhereInputSchema).optional()
}).strict();

export const artistTableUpdateToOneWithWhereWithoutImagesInputSchema: z.ZodType<Prisma.artistTableUpdateToOneWithWhereWithoutImagesInput> = z.object({
  where: z.lazy(() => artistTableWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => artistTableUpdateWithoutImagesInputSchema),z.lazy(() => artistTableUncheckedUpdateWithoutImagesInputSchema) ]),
}).strict();

export const artistTableUpdateWithoutImagesInputSchema: z.ZodType<Prisma.artistTableUpdateWithoutImagesInput> = z.object({
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  postcode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstNations: z.union([ z.lazy(() => IndigenousSchema),z.lazy(() => EnumIndigenousFieldUpdateOperationsInputSchema) ]).optional(),
  bankAccountName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bankBSB: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bankAccount: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  registrations: z.lazy(() => registrationTableUpdateManyWithoutArtistNestedInputSchema).optional(),
  entries: z.lazy(() => entryTableUpdateManyWithoutArtistNestedInputSchema).optional()
}).strict();

export const artistTableUncheckedUpdateWithoutImagesInputSchema: z.ZodType<Prisma.artistTableUncheckedUpdateWithoutImagesInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  postcode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstNations: z.union([ z.lazy(() => IndigenousSchema),z.lazy(() => EnumIndigenousFieldUpdateOperationsInputSchema) ]).optional(),
  bankAccountName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bankBSB: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bankAccount: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  registrations: z.lazy(() => registrationTableUncheckedUpdateManyWithoutArtistNestedInputSchema).optional(),
  entries: z.lazy(() => entryTableUncheckedUpdateManyWithoutArtistNestedInputSchema).optional()
}).strict();

export const registrationTableUpsertWithoutImagesInputSchema: z.ZodType<Prisma.registrationTableUpsertWithoutImagesInput> = z.object({
  update: z.union([ z.lazy(() => registrationTableUpdateWithoutImagesInputSchema),z.lazy(() => registrationTableUncheckedUpdateWithoutImagesInputSchema) ]),
  create: z.union([ z.lazy(() => registrationTableCreateWithoutImagesInputSchema),z.lazy(() => registrationTableUncheckedCreateWithoutImagesInputSchema) ]),
  where: z.lazy(() => registrationTableWhereInputSchema).optional()
}).strict();

export const registrationTableUpdateToOneWithWhereWithoutImagesInputSchema: z.ZodType<Prisma.registrationTableUpdateToOneWithWhereWithoutImagesInput> = z.object({
  where: z.lazy(() => registrationTableWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => registrationTableUpdateWithoutImagesInputSchema),z.lazy(() => registrationTableUncheckedUpdateWithoutImagesInputSchema) ]),
}).strict();

export const registrationTableUpdateWithoutImagesInputSchema: z.ZodType<Prisma.registrationTableUpdateWithoutImagesInput> = z.object({
  registrationYear: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  closed: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  bumpIn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bumpOut: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  displayRequirements: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accommodation: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  crane: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  transport: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  artist: z.lazy(() => artistTableUpdateOneRequiredWithoutRegistrationsNestedInputSchema).optional(),
  entries: z.lazy(() => entryTableUpdateManyWithoutRegistrationNestedInputSchema).optional()
}).strict();

export const registrationTableUncheckedUpdateWithoutImagesInputSchema: z.ZodType<Prisma.registrationTableUncheckedUpdateWithoutImagesInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  artistId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  registrationYear: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  closed: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  bumpIn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bumpOut: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  displayRequirements: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accommodation: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  crane: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  transport: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  entries: z.lazy(() => entryTableUncheckedUpdateManyWithoutRegistrationNestedInputSchema).optional()
}).strict();

export const entryTableUpsertWithoutImagesInputSchema: z.ZodType<Prisma.entryTableUpsertWithoutImagesInput> = z.object({
  update: z.union([ z.lazy(() => entryTableUpdateWithoutImagesInputSchema),z.lazy(() => entryTableUncheckedUpdateWithoutImagesInputSchema) ]),
  create: z.union([ z.lazy(() => entryTableCreateWithoutImagesInputSchema),z.lazy(() => entryTableUncheckedCreateWithoutImagesInputSchema) ]),
  where: z.lazy(() => entryTableWhereInputSchema).optional()
}).strict();

export const entryTableUpdateToOneWithWhereWithoutImagesInputSchema: z.ZodType<Prisma.entryTableUpdateToOneWithWhereWithoutImagesInput> = z.object({
  where: z.lazy(() => entryTableWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => entryTableUpdateWithoutImagesInputSchema),z.lazy(() => entryTableUncheckedUpdateWithoutImagesInputSchema) ]),
}).strict();

export const entryTableUpdateWithoutImagesInputSchema: z.ZodType<Prisma.entryTableUpdateWithoutImagesInput> = z.object({
  accepted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  dimensions: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  enterMajorPrize: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  inOrOut: z.union([ z.lazy(() => EntryTypeSchema),z.lazy(() => NullableEnumEntryTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  material: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  price: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  specialRequirements: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  artist: z.lazy(() => artistTableUpdateOneRequiredWithoutEntriesNestedInputSchema).optional(),
  registration: z.lazy(() => registrationTableUpdateOneRequiredWithoutEntriesNestedInputSchema).optional()
}).strict();

export const entryTableUncheckedUpdateWithoutImagesInputSchema: z.ZodType<Prisma.entryTableUncheckedUpdateWithoutImagesInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  artistId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  accepted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  registrationId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  dimensions: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  enterMajorPrize: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  inOrOut: z.union([ z.lazy(() => EntryTypeSchema),z.lazy(() => NullableEnumEntryTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  material: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  price: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  specialRequirements: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const registrationTableCreateManyArtistInputSchema: z.ZodType<Prisma.registrationTableCreateManyArtistInput> = z.object({
  id: z.number().int().optional(),
  registrationYear: z.string(),
  closed: z.boolean().optional(),
  bumpIn: z.string().optional().nullable(),
  bumpOut: z.string().optional().nullable(),
  displayRequirements: z.string().optional().nullable(),
  accommodation: z.boolean().optional().nullable(),
  crane: z.boolean().optional().nullable(),
  transport: z.boolean().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const imageTableCreateManyArtistInputSchema: z.ZodType<Prisma.imageTableCreateManyArtistInput> = z.object({
  id: z.number().int().optional(),
  registrationId: z.number().int().optional().nullable(),
  entryId: z.number().int().optional().nullable(),
  cloudId: z.string(),
  cloudURL: z.string(),
  originalFileName: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const entryTableCreateManyArtistInputSchema: z.ZodType<Prisma.entryTableCreateManyArtistInput> = z.object({
  id: z.number().int().optional(),
  accepted: z.boolean().optional(),
  registrationId: z.number().int(),
  description: z.string().optional().nullable(),
  dimensions: z.string().optional().nullable(),
  enterMajorPrize: z.boolean().optional(),
  inOrOut: z.lazy(() => EntryTypeSchema).optional().nullable(),
  material: z.string().optional().nullable(),
  price: z.number().int().optional().nullable(),
  specialRequirements: z.string().optional().nullable(),
  title: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const registrationTableUpdateWithoutArtistInputSchema: z.ZodType<Prisma.registrationTableUpdateWithoutArtistInput> = z.object({
  registrationYear: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  closed: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  bumpIn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bumpOut: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  displayRequirements: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accommodation: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  crane: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  transport: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  entries: z.lazy(() => entryTableUpdateManyWithoutRegistrationNestedInputSchema).optional(),
  images: z.lazy(() => imageTableUpdateManyWithoutRegistrationNestedInputSchema).optional()
}).strict();

export const registrationTableUncheckedUpdateWithoutArtistInputSchema: z.ZodType<Prisma.registrationTableUncheckedUpdateWithoutArtistInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  registrationYear: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  closed: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  bumpIn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bumpOut: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  displayRequirements: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accommodation: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  crane: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  transport: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  entries: z.lazy(() => entryTableUncheckedUpdateManyWithoutRegistrationNestedInputSchema).optional(),
  images: z.lazy(() => imageTableUncheckedUpdateManyWithoutRegistrationNestedInputSchema).optional()
}).strict();

export const registrationTableUncheckedUpdateManyWithoutArtistInputSchema: z.ZodType<Prisma.registrationTableUncheckedUpdateManyWithoutArtistInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  registrationYear: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  closed: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  bumpIn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bumpOut: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  displayRequirements: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accommodation: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  crane: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  transport: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const imageTableUpdateWithoutArtistInputSchema: z.ZodType<Prisma.imageTableUpdateWithoutArtistInput> = z.object({
  cloudId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  cloudURL: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  originalFileName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  registration: z.lazy(() => registrationTableUpdateOneWithoutImagesNestedInputSchema).optional(),
  entry: z.lazy(() => entryTableUpdateOneWithoutImagesNestedInputSchema).optional()
}).strict();

export const imageTableUncheckedUpdateWithoutArtistInputSchema: z.ZodType<Prisma.imageTableUncheckedUpdateWithoutArtistInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  registrationId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  entryId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cloudId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  cloudURL: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  originalFileName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const imageTableUncheckedUpdateManyWithoutArtistInputSchema: z.ZodType<Prisma.imageTableUncheckedUpdateManyWithoutArtistInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  registrationId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  entryId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cloudId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  cloudURL: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  originalFileName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const entryTableUpdateWithoutArtistInputSchema: z.ZodType<Prisma.entryTableUpdateWithoutArtistInput> = z.object({
  accepted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  dimensions: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  enterMajorPrize: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  inOrOut: z.union([ z.lazy(() => EntryTypeSchema),z.lazy(() => NullableEnumEntryTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  material: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  price: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  specialRequirements: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  images: z.lazy(() => imageTableUpdateManyWithoutEntryNestedInputSchema).optional(),
  registration: z.lazy(() => registrationTableUpdateOneRequiredWithoutEntriesNestedInputSchema).optional()
}).strict();

export const entryTableUncheckedUpdateWithoutArtistInputSchema: z.ZodType<Prisma.entryTableUncheckedUpdateWithoutArtistInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  accepted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  registrationId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  dimensions: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  enterMajorPrize: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  inOrOut: z.union([ z.lazy(() => EntryTypeSchema),z.lazy(() => NullableEnumEntryTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  material: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  price: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  specialRequirements: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  images: z.lazy(() => imageTableUncheckedUpdateManyWithoutEntryNestedInputSchema).optional()
}).strict();

export const entryTableUncheckedUpdateManyWithoutArtistInputSchema: z.ZodType<Prisma.entryTableUncheckedUpdateManyWithoutArtistInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  accepted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  registrationId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  dimensions: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  enterMajorPrize: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  inOrOut: z.union([ z.lazy(() => EntryTypeSchema),z.lazy(() => NullableEnumEntryTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  material: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  price: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  specialRequirements: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const entryTableCreateManyRegistrationInputSchema: z.ZodType<Prisma.entryTableCreateManyRegistrationInput> = z.object({
  id: z.number().int().optional(),
  artistId: z.number().int(),
  accepted: z.boolean().optional(),
  description: z.string().optional().nullable(),
  dimensions: z.string().optional().nullable(),
  enterMajorPrize: z.boolean().optional(),
  inOrOut: z.lazy(() => EntryTypeSchema).optional().nullable(),
  material: z.string().optional().nullable(),
  price: z.number().int().optional().nullable(),
  specialRequirements: z.string().optional().nullable(),
  title: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const imageTableCreateManyRegistrationInputSchema: z.ZodType<Prisma.imageTableCreateManyRegistrationInput> = z.object({
  id: z.number().int().optional(),
  artistId: z.number().int(),
  entryId: z.number().int().optional().nullable(),
  cloudId: z.string(),
  cloudURL: z.string(),
  originalFileName: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const entryTableUpdateWithoutRegistrationInputSchema: z.ZodType<Prisma.entryTableUpdateWithoutRegistrationInput> = z.object({
  accepted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  dimensions: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  enterMajorPrize: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  inOrOut: z.union([ z.lazy(() => EntryTypeSchema),z.lazy(() => NullableEnumEntryTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  material: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  price: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  specialRequirements: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  images: z.lazy(() => imageTableUpdateManyWithoutEntryNestedInputSchema).optional(),
  artist: z.lazy(() => artistTableUpdateOneRequiredWithoutEntriesNestedInputSchema).optional()
}).strict();

export const entryTableUncheckedUpdateWithoutRegistrationInputSchema: z.ZodType<Prisma.entryTableUncheckedUpdateWithoutRegistrationInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  artistId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  accepted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  dimensions: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  enterMajorPrize: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  inOrOut: z.union([ z.lazy(() => EntryTypeSchema),z.lazy(() => NullableEnumEntryTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  material: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  price: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  specialRequirements: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  images: z.lazy(() => imageTableUncheckedUpdateManyWithoutEntryNestedInputSchema).optional()
}).strict();

export const entryTableUncheckedUpdateManyWithoutRegistrationInputSchema: z.ZodType<Prisma.entryTableUncheckedUpdateManyWithoutRegistrationInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  artistId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  accepted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  dimensions: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  enterMajorPrize: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  inOrOut: z.union([ z.lazy(() => EntryTypeSchema),z.lazy(() => NullableEnumEntryTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  material: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  price: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  specialRequirements: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const imageTableUpdateWithoutRegistrationInputSchema: z.ZodType<Prisma.imageTableUpdateWithoutRegistrationInput> = z.object({
  cloudId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  cloudURL: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  originalFileName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  artist: z.lazy(() => artistTableUpdateOneRequiredWithoutImagesNestedInputSchema).optional(),
  entry: z.lazy(() => entryTableUpdateOneWithoutImagesNestedInputSchema).optional()
}).strict();

export const imageTableUncheckedUpdateWithoutRegistrationInputSchema: z.ZodType<Prisma.imageTableUncheckedUpdateWithoutRegistrationInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  artistId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  entryId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cloudId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  cloudURL: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  originalFileName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const imageTableUncheckedUpdateManyWithoutRegistrationInputSchema: z.ZodType<Prisma.imageTableUncheckedUpdateManyWithoutRegistrationInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  artistId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  entryId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cloudId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  cloudURL: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  originalFileName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const imageTableCreateManyEntryInputSchema: z.ZodType<Prisma.imageTableCreateManyEntryInput> = z.object({
  id: z.number().int().optional(),
  artistId: z.number().int(),
  registrationId: z.number().int().optional().nullable(),
  cloudId: z.string(),
  cloudURL: z.string(),
  originalFileName: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const imageTableUpdateWithoutEntryInputSchema: z.ZodType<Prisma.imageTableUpdateWithoutEntryInput> = z.object({
  cloudId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  cloudURL: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  originalFileName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  artist: z.lazy(() => artistTableUpdateOneRequiredWithoutImagesNestedInputSchema).optional(),
  registration: z.lazy(() => registrationTableUpdateOneWithoutImagesNestedInputSchema).optional()
}).strict();

export const imageTableUncheckedUpdateWithoutEntryInputSchema: z.ZodType<Prisma.imageTableUncheckedUpdateWithoutEntryInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  artistId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  registrationId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cloudId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  cloudURL: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  originalFileName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const imageTableUncheckedUpdateManyWithoutEntryInputSchema: z.ZodType<Prisma.imageTableUncheckedUpdateManyWithoutEntryInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  artistId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  registrationId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cloudId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  cloudURL: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  originalFileName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const artistTableFindFirstArgsSchema: z.ZodType<Prisma.artistTableFindFirstArgs> = z.object({
  select: artistTableSelectSchema.optional(),
  include: artistTableIncludeSchema.optional(),
  where: artistTableWhereInputSchema.optional(),
  orderBy: z.union([ artistTableOrderByWithRelationInputSchema.array(),artistTableOrderByWithRelationInputSchema ]).optional(),
  cursor: artistTableWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ArtistTableScalarFieldEnumSchema,ArtistTableScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const artistTableFindFirstOrThrowArgsSchema: z.ZodType<Prisma.artistTableFindFirstOrThrowArgs> = z.object({
  select: artistTableSelectSchema.optional(),
  include: artistTableIncludeSchema.optional(),
  where: artistTableWhereInputSchema.optional(),
  orderBy: z.union([ artistTableOrderByWithRelationInputSchema.array(),artistTableOrderByWithRelationInputSchema ]).optional(),
  cursor: artistTableWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ArtistTableScalarFieldEnumSchema,ArtistTableScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const artistTableFindManyArgsSchema: z.ZodType<Prisma.artistTableFindManyArgs> = z.object({
  select: artistTableSelectSchema.optional(),
  include: artistTableIncludeSchema.optional(),
  where: artistTableWhereInputSchema.optional(),
  orderBy: z.union([ artistTableOrderByWithRelationInputSchema.array(),artistTableOrderByWithRelationInputSchema ]).optional(),
  cursor: artistTableWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ArtistTableScalarFieldEnumSchema,ArtistTableScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const artistTableAggregateArgsSchema: z.ZodType<Prisma.artistTableAggregateArgs> = z.object({
  where: artistTableWhereInputSchema.optional(),
  orderBy: z.union([ artistTableOrderByWithRelationInputSchema.array(),artistTableOrderByWithRelationInputSchema ]).optional(),
  cursor: artistTableWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const artistTableGroupByArgsSchema: z.ZodType<Prisma.artistTableGroupByArgs> = z.object({
  where: artistTableWhereInputSchema.optional(),
  orderBy: z.union([ artistTableOrderByWithAggregationInputSchema.array(),artistTableOrderByWithAggregationInputSchema ]).optional(),
  by: ArtistTableScalarFieldEnumSchema.array(),
  having: artistTableScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const artistTableFindUniqueArgsSchema: z.ZodType<Prisma.artistTableFindUniqueArgs> = z.object({
  select: artistTableSelectSchema.optional(),
  include: artistTableIncludeSchema.optional(),
  where: artistTableWhereUniqueInputSchema,
}).strict() ;

export const artistTableFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.artistTableFindUniqueOrThrowArgs> = z.object({
  select: artistTableSelectSchema.optional(),
  include: artistTableIncludeSchema.optional(),
  where: artistTableWhereUniqueInputSchema,
}).strict() ;

export const registrationTableFindFirstArgsSchema: z.ZodType<Prisma.registrationTableFindFirstArgs> = z.object({
  select: registrationTableSelectSchema.optional(),
  include: registrationTableIncludeSchema.optional(),
  where: registrationTableWhereInputSchema.optional(),
  orderBy: z.union([ registrationTableOrderByWithRelationInputSchema.array(),registrationTableOrderByWithRelationInputSchema ]).optional(),
  cursor: registrationTableWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ RegistrationTableScalarFieldEnumSchema,RegistrationTableScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const registrationTableFindFirstOrThrowArgsSchema: z.ZodType<Prisma.registrationTableFindFirstOrThrowArgs> = z.object({
  select: registrationTableSelectSchema.optional(),
  include: registrationTableIncludeSchema.optional(),
  where: registrationTableWhereInputSchema.optional(),
  orderBy: z.union([ registrationTableOrderByWithRelationInputSchema.array(),registrationTableOrderByWithRelationInputSchema ]).optional(),
  cursor: registrationTableWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ RegistrationTableScalarFieldEnumSchema,RegistrationTableScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const registrationTableFindManyArgsSchema: z.ZodType<Prisma.registrationTableFindManyArgs> = z.object({
  select: registrationTableSelectSchema.optional(),
  include: registrationTableIncludeSchema.optional(),
  where: registrationTableWhereInputSchema.optional(),
  orderBy: z.union([ registrationTableOrderByWithRelationInputSchema.array(),registrationTableOrderByWithRelationInputSchema ]).optional(),
  cursor: registrationTableWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ RegistrationTableScalarFieldEnumSchema,RegistrationTableScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const registrationTableAggregateArgsSchema: z.ZodType<Prisma.registrationTableAggregateArgs> = z.object({
  where: registrationTableWhereInputSchema.optional(),
  orderBy: z.union([ registrationTableOrderByWithRelationInputSchema.array(),registrationTableOrderByWithRelationInputSchema ]).optional(),
  cursor: registrationTableWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const registrationTableGroupByArgsSchema: z.ZodType<Prisma.registrationTableGroupByArgs> = z.object({
  where: registrationTableWhereInputSchema.optional(),
  orderBy: z.union([ registrationTableOrderByWithAggregationInputSchema.array(),registrationTableOrderByWithAggregationInputSchema ]).optional(),
  by: RegistrationTableScalarFieldEnumSchema.array(),
  having: registrationTableScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const registrationTableFindUniqueArgsSchema: z.ZodType<Prisma.registrationTableFindUniqueArgs> = z.object({
  select: registrationTableSelectSchema.optional(),
  include: registrationTableIncludeSchema.optional(),
  where: registrationTableWhereUniqueInputSchema,
}).strict() ;

export const registrationTableFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.registrationTableFindUniqueOrThrowArgs> = z.object({
  select: registrationTableSelectSchema.optional(),
  include: registrationTableIncludeSchema.optional(),
  where: registrationTableWhereUniqueInputSchema,
}).strict() ;

export const entryTableFindFirstArgsSchema: z.ZodType<Prisma.entryTableFindFirstArgs> = z.object({
  select: entryTableSelectSchema.optional(),
  include: entryTableIncludeSchema.optional(),
  where: entryTableWhereInputSchema.optional(),
  orderBy: z.union([ entryTableOrderByWithRelationInputSchema.array(),entryTableOrderByWithRelationInputSchema ]).optional(),
  cursor: entryTableWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EntryTableScalarFieldEnumSchema,EntryTableScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const entryTableFindFirstOrThrowArgsSchema: z.ZodType<Prisma.entryTableFindFirstOrThrowArgs> = z.object({
  select: entryTableSelectSchema.optional(),
  include: entryTableIncludeSchema.optional(),
  where: entryTableWhereInputSchema.optional(),
  orderBy: z.union([ entryTableOrderByWithRelationInputSchema.array(),entryTableOrderByWithRelationInputSchema ]).optional(),
  cursor: entryTableWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EntryTableScalarFieldEnumSchema,EntryTableScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const entryTableFindManyArgsSchema: z.ZodType<Prisma.entryTableFindManyArgs> = z.object({
  select: entryTableSelectSchema.optional(),
  include: entryTableIncludeSchema.optional(),
  where: entryTableWhereInputSchema.optional(),
  orderBy: z.union([ entryTableOrderByWithRelationInputSchema.array(),entryTableOrderByWithRelationInputSchema ]).optional(),
  cursor: entryTableWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EntryTableScalarFieldEnumSchema,EntryTableScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const entryTableAggregateArgsSchema: z.ZodType<Prisma.entryTableAggregateArgs> = z.object({
  where: entryTableWhereInputSchema.optional(),
  orderBy: z.union([ entryTableOrderByWithRelationInputSchema.array(),entryTableOrderByWithRelationInputSchema ]).optional(),
  cursor: entryTableWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const entryTableGroupByArgsSchema: z.ZodType<Prisma.entryTableGroupByArgs> = z.object({
  where: entryTableWhereInputSchema.optional(),
  orderBy: z.union([ entryTableOrderByWithAggregationInputSchema.array(),entryTableOrderByWithAggregationInputSchema ]).optional(),
  by: EntryTableScalarFieldEnumSchema.array(),
  having: entryTableScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const entryTableFindUniqueArgsSchema: z.ZodType<Prisma.entryTableFindUniqueArgs> = z.object({
  select: entryTableSelectSchema.optional(),
  include: entryTableIncludeSchema.optional(),
  where: entryTableWhereUniqueInputSchema,
}).strict() ;

export const entryTableFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.entryTableFindUniqueOrThrowArgs> = z.object({
  select: entryTableSelectSchema.optional(),
  include: entryTableIncludeSchema.optional(),
  where: entryTableWhereUniqueInputSchema,
}).strict() ;

export const imageTableFindFirstArgsSchema: z.ZodType<Prisma.imageTableFindFirstArgs> = z.object({
  select: imageTableSelectSchema.optional(),
  include: imageTableIncludeSchema.optional(),
  where: imageTableWhereInputSchema.optional(),
  orderBy: z.union([ imageTableOrderByWithRelationInputSchema.array(),imageTableOrderByWithRelationInputSchema ]).optional(),
  cursor: imageTableWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ImageTableScalarFieldEnumSchema,ImageTableScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const imageTableFindFirstOrThrowArgsSchema: z.ZodType<Prisma.imageTableFindFirstOrThrowArgs> = z.object({
  select: imageTableSelectSchema.optional(),
  include: imageTableIncludeSchema.optional(),
  where: imageTableWhereInputSchema.optional(),
  orderBy: z.union([ imageTableOrderByWithRelationInputSchema.array(),imageTableOrderByWithRelationInputSchema ]).optional(),
  cursor: imageTableWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ImageTableScalarFieldEnumSchema,ImageTableScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const imageTableFindManyArgsSchema: z.ZodType<Prisma.imageTableFindManyArgs> = z.object({
  select: imageTableSelectSchema.optional(),
  include: imageTableIncludeSchema.optional(),
  where: imageTableWhereInputSchema.optional(),
  orderBy: z.union([ imageTableOrderByWithRelationInputSchema.array(),imageTableOrderByWithRelationInputSchema ]).optional(),
  cursor: imageTableWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ImageTableScalarFieldEnumSchema,ImageTableScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const imageTableAggregateArgsSchema: z.ZodType<Prisma.imageTableAggregateArgs> = z.object({
  where: imageTableWhereInputSchema.optional(),
  orderBy: z.union([ imageTableOrderByWithRelationInputSchema.array(),imageTableOrderByWithRelationInputSchema ]).optional(),
  cursor: imageTableWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const imageTableGroupByArgsSchema: z.ZodType<Prisma.imageTableGroupByArgs> = z.object({
  where: imageTableWhereInputSchema.optional(),
  orderBy: z.union([ imageTableOrderByWithAggregationInputSchema.array(),imageTableOrderByWithAggregationInputSchema ]).optional(),
  by: ImageTableScalarFieldEnumSchema.array(),
  having: imageTableScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const imageTableFindUniqueArgsSchema: z.ZodType<Prisma.imageTableFindUniqueArgs> = z.object({
  select: imageTableSelectSchema.optional(),
  include: imageTableIncludeSchema.optional(),
  where: imageTableWhereUniqueInputSchema,
}).strict() ;

export const imageTableFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.imageTableFindUniqueOrThrowArgs> = z.object({
  select: imageTableSelectSchema.optional(),
  include: imageTableIncludeSchema.optional(),
  where: imageTableWhereUniqueInputSchema,
}).strict() ;

export const artistTableCreateArgsSchema: z.ZodType<Prisma.artistTableCreateArgs> = z.object({
  select: artistTableSelectSchema.optional(),
  include: artistTableIncludeSchema.optional(),
  data: z.union([ artistTableCreateInputSchema,artistTableUncheckedCreateInputSchema ]),
}).strict() ;

export const artistTableUpsertArgsSchema: z.ZodType<Prisma.artistTableUpsertArgs> = z.object({
  select: artistTableSelectSchema.optional(),
  include: artistTableIncludeSchema.optional(),
  where: artistTableWhereUniqueInputSchema,
  create: z.union([ artistTableCreateInputSchema,artistTableUncheckedCreateInputSchema ]),
  update: z.union([ artistTableUpdateInputSchema,artistTableUncheckedUpdateInputSchema ]),
}).strict() ;

export const artistTableCreateManyArgsSchema: z.ZodType<Prisma.artistTableCreateManyArgs> = z.object({
  data: z.union([ artistTableCreateManyInputSchema,artistTableCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const artistTableDeleteArgsSchema: z.ZodType<Prisma.artistTableDeleteArgs> = z.object({
  select: artistTableSelectSchema.optional(),
  include: artistTableIncludeSchema.optional(),
  where: artistTableWhereUniqueInputSchema,
}).strict() ;

export const artistTableUpdateArgsSchema: z.ZodType<Prisma.artistTableUpdateArgs> = z.object({
  select: artistTableSelectSchema.optional(),
  include: artistTableIncludeSchema.optional(),
  data: z.union([ artistTableUpdateInputSchema,artistTableUncheckedUpdateInputSchema ]),
  where: artistTableWhereUniqueInputSchema,
}).strict() ;

export const artistTableUpdateManyArgsSchema: z.ZodType<Prisma.artistTableUpdateManyArgs> = z.object({
  data: z.union([ artistTableUpdateManyMutationInputSchema,artistTableUncheckedUpdateManyInputSchema ]),
  where: artistTableWhereInputSchema.optional(),
}).strict() ;

export const artistTableDeleteManyArgsSchema: z.ZodType<Prisma.artistTableDeleteManyArgs> = z.object({
  where: artistTableWhereInputSchema.optional(),
}).strict() ;

export const registrationTableCreateArgsSchema: z.ZodType<Prisma.registrationTableCreateArgs> = z.object({
  select: registrationTableSelectSchema.optional(),
  include: registrationTableIncludeSchema.optional(),
  data: z.union([ registrationTableCreateInputSchema,registrationTableUncheckedCreateInputSchema ]),
}).strict() ;

export const registrationTableUpsertArgsSchema: z.ZodType<Prisma.registrationTableUpsertArgs> = z.object({
  select: registrationTableSelectSchema.optional(),
  include: registrationTableIncludeSchema.optional(),
  where: registrationTableWhereUniqueInputSchema,
  create: z.union([ registrationTableCreateInputSchema,registrationTableUncheckedCreateInputSchema ]),
  update: z.union([ registrationTableUpdateInputSchema,registrationTableUncheckedUpdateInputSchema ]),
}).strict() ;

export const registrationTableCreateManyArgsSchema: z.ZodType<Prisma.registrationTableCreateManyArgs> = z.object({
  data: z.union([ registrationTableCreateManyInputSchema,registrationTableCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const registrationTableDeleteArgsSchema: z.ZodType<Prisma.registrationTableDeleteArgs> = z.object({
  select: registrationTableSelectSchema.optional(),
  include: registrationTableIncludeSchema.optional(),
  where: registrationTableWhereUniqueInputSchema,
}).strict() ;

export const registrationTableUpdateArgsSchema: z.ZodType<Prisma.registrationTableUpdateArgs> = z.object({
  select: registrationTableSelectSchema.optional(),
  include: registrationTableIncludeSchema.optional(),
  data: z.union([ registrationTableUpdateInputSchema,registrationTableUncheckedUpdateInputSchema ]),
  where: registrationTableWhereUniqueInputSchema,
}).strict() ;

export const registrationTableUpdateManyArgsSchema: z.ZodType<Prisma.registrationTableUpdateManyArgs> = z.object({
  data: z.union([ registrationTableUpdateManyMutationInputSchema,registrationTableUncheckedUpdateManyInputSchema ]),
  where: registrationTableWhereInputSchema.optional(),
}).strict() ;

export const registrationTableDeleteManyArgsSchema: z.ZodType<Prisma.registrationTableDeleteManyArgs> = z.object({
  where: registrationTableWhereInputSchema.optional(),
}).strict() ;

export const entryTableCreateArgsSchema: z.ZodType<Prisma.entryTableCreateArgs> = z.object({
  select: entryTableSelectSchema.optional(),
  include: entryTableIncludeSchema.optional(),
  data: z.union([ entryTableCreateInputSchema,entryTableUncheckedCreateInputSchema ]),
}).strict() ;

export const entryTableUpsertArgsSchema: z.ZodType<Prisma.entryTableUpsertArgs> = z.object({
  select: entryTableSelectSchema.optional(),
  include: entryTableIncludeSchema.optional(),
  where: entryTableWhereUniqueInputSchema,
  create: z.union([ entryTableCreateInputSchema,entryTableUncheckedCreateInputSchema ]),
  update: z.union([ entryTableUpdateInputSchema,entryTableUncheckedUpdateInputSchema ]),
}).strict() ;

export const entryTableCreateManyArgsSchema: z.ZodType<Prisma.entryTableCreateManyArgs> = z.object({
  data: z.union([ entryTableCreateManyInputSchema,entryTableCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const entryTableDeleteArgsSchema: z.ZodType<Prisma.entryTableDeleteArgs> = z.object({
  select: entryTableSelectSchema.optional(),
  include: entryTableIncludeSchema.optional(),
  where: entryTableWhereUniqueInputSchema,
}).strict() ;

export const entryTableUpdateArgsSchema: z.ZodType<Prisma.entryTableUpdateArgs> = z.object({
  select: entryTableSelectSchema.optional(),
  include: entryTableIncludeSchema.optional(),
  data: z.union([ entryTableUpdateInputSchema,entryTableUncheckedUpdateInputSchema ]),
  where: entryTableWhereUniqueInputSchema,
}).strict() ;

export const entryTableUpdateManyArgsSchema: z.ZodType<Prisma.entryTableUpdateManyArgs> = z.object({
  data: z.union([ entryTableUpdateManyMutationInputSchema,entryTableUncheckedUpdateManyInputSchema ]),
  where: entryTableWhereInputSchema.optional(),
}).strict() ;

export const entryTableDeleteManyArgsSchema: z.ZodType<Prisma.entryTableDeleteManyArgs> = z.object({
  where: entryTableWhereInputSchema.optional(),
}).strict() ;

export const imageTableCreateArgsSchema: z.ZodType<Prisma.imageTableCreateArgs> = z.object({
  select: imageTableSelectSchema.optional(),
  include: imageTableIncludeSchema.optional(),
  data: z.union([ imageTableCreateInputSchema,imageTableUncheckedCreateInputSchema ]),
}).strict() ;

export const imageTableUpsertArgsSchema: z.ZodType<Prisma.imageTableUpsertArgs> = z.object({
  select: imageTableSelectSchema.optional(),
  include: imageTableIncludeSchema.optional(),
  where: imageTableWhereUniqueInputSchema,
  create: z.union([ imageTableCreateInputSchema,imageTableUncheckedCreateInputSchema ]),
  update: z.union([ imageTableUpdateInputSchema,imageTableUncheckedUpdateInputSchema ]),
}).strict() ;

export const imageTableCreateManyArgsSchema: z.ZodType<Prisma.imageTableCreateManyArgs> = z.object({
  data: z.union([ imageTableCreateManyInputSchema,imageTableCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const imageTableDeleteArgsSchema: z.ZodType<Prisma.imageTableDeleteArgs> = z.object({
  select: imageTableSelectSchema.optional(),
  include: imageTableIncludeSchema.optional(),
  where: imageTableWhereUniqueInputSchema,
}).strict() ;

export const imageTableUpdateArgsSchema: z.ZodType<Prisma.imageTableUpdateArgs> = z.object({
  select: imageTableSelectSchema.optional(),
  include: imageTableIncludeSchema.optional(),
  data: z.union([ imageTableUpdateInputSchema,imageTableUncheckedUpdateInputSchema ]),
  where: imageTableWhereUniqueInputSchema,
}).strict() ;

export const imageTableUpdateManyArgsSchema: z.ZodType<Prisma.imageTableUpdateManyArgs> = z.object({
  data: z.union([ imageTableUpdateManyMutationInputSchema,imageTableUncheckedUpdateManyInputSchema ]),
  where: imageTableWhereInputSchema.optional(),
}).strict() ;

export const imageTableDeleteManyArgsSchema: z.ZodType<Prisma.imageTableDeleteManyArgs> = z.object({
  where: imageTableWhereInputSchema.optional(),
}).strict() ;