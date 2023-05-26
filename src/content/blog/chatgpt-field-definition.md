---
title: ChatGPT For Help With TypeScript Types
description: An example of how I've used ChatGPT in my day-to-day job for creating an advanced TypeScript type
pubDatetime: 2023-05-24T00:47:00Z
tags:
  - typescript
  - chatgpt
  - development
---

## Table of Contents

## Introduction

ChatGPT has picked up really quickly in the last year or so. Today I thought I would write about an actual scenario where ChatGPT can be useful to developers in their daily lives.
I'm comfortable with some of the more advanced voodoo you can do with TypeScript (in fact, I already knew the solution to this particular problem), so perhaps I already understood how to correctly prompt ChatGPT to get me to the end result.
Nevertheless, I think a moderate-level TypeScript developer could have navigated ChatGPT in the same way I'll show in this post.

## The Conversation

Rather than re-hash and re-explain the problem I wanted to solve, I will just post my initial prompt to ChatGPT word for word, with no adjustments. Theoretically a human should be able to understand my prompt as well as (if not better than) the machine.

### Initial Prompt

> I would like to write a TypeScript type called `FieldDefinition<T>` to represent the following structure.  `EbitSummary` is an example of a generic type I would like to pass into `FieldDefinition<T>`, but it should work for all types.
> 
> Here are some predefined types and functions:
> ```ts
> interface EbitSummary {
>   name: string
>   milesFromWarehouse: number
> }
>
> const sortNumber = (a: number, b: number) => a - b
> const sortString = (a: string, b: string) => a.localeCompare(b)
> ```
>
> Here is an example of a VALID use of the type:
> ```ts
> const headers: FieldDefinition<EbitSummary> = [
>   {  key: 'name', label: 'Customer Name', sort: sortString },
>   {  key: 'milesFromWarehouse', label: 'Miles', sort: sortNumber },
> ]
> ```
>
> Here is are some examples of INVALID uses of the type:
> ```ts
> // Error because `milesFromWarehouse` is a number
> const invalidHeaders1: FieldDefinition<EbitSummary> = [
>   {  key: 'name', label: 'Customer Name', sort: sortString },
>   {  key: 'milesFromWarehouse', label: 'Miles', sort: sortString },
> ]
> 
> // Error because `nmae` is not a property of `EbitSummary`
> const invalidHeaders2: FieldDefinition<EbitSummary> = [
>   {  key: 'nmae', label: 'Customer Name', sort: sortString },
>   {  key: 'milesFromWarehouse', label: 'Miles', sort: sortNumber },
> ]
> ```

It's not cheating to give a few test cases when crafting a LLM prompt. I've found it helps **a lot** to kickstart the model's understanding of what you're trying to do.

### First Response

Here is the response to that initial prompt.

> You can define the FieldDefinition<T> type in TypeScript as follows:
> 
> ```ts
> type FieldDefinition<T> = Array<{
>   key: keyof T
>   label: string
>   sort: (a: T[keyof T], b: T[keyof T]) => number
> }>
> ```
> This type represents an array of objects, where each object has a key property that is a keyof T (a key of the generic type T), a label property of type string, and a sort property that is a function accepting two parameters of type T[keyof T] (the corresponding value type of the key) and returning a number.
> 
> Using this type, here's an example of a valid use:
> 
> ```ts
> const headers: FieldDefinition<EbitSummary> = [
>   { key: 'name', label: 'Customer Name', sort: sortString },
>   { key: 'milesFromWarehouse', label: 'Miles', sort: sortNumber },
> ]
> ```
> And here are the examples of invalid uses you provided:
> 
> ```ts
> // Error: sort function is not compatible with the type of 'milesFromWarehouse'
> const invalidHeaders1: FieldDefinition<EbitSummary> = [
>   { key: 'name', label: 'Customer Name', sort: sortString },
>   { key: 'milesFromWarehouse', label: 'Miles', sort: sortString },
> ]
> 
> // Error: 'nmae' is not a property of 'EbitSummary'
> const invalidHeaders2: FieldDefinition<EbitSummary> = [
>   { key: 'nmae', label: 'Customer Name', sort: sortString },
>   { key: 'milesFromWarehouse', label: 'Miles', sort: sortNumber },
> ]
> ```
> By defining the FieldDefinition<T> type, you ensure that the keys used in the key property correspond to valid properties of the generic type T, and that the sort function is compatible with the value type associated with the given key.

A solid first response! It's smart enough to understand the test scenarios I gave it and properly describe the type we want in more technical terms.

It decided to define the generic type as an array already, which is not what I asked for, but I can overlook that small issue.
There is one larger problem with this solution though: the type of `sort` is not properly inferred. Instead it's just a union of all possible types:

```ts
const headers: FieldDefinition<EbitSummary> = [
  { key: 'name', label: 'Customer Name', sort: (a, b) => a.localeCompare(b) },
  // Error! a and b are both of type `string | number`, despite the fact that "name" is definitely a string
]
```

### Refining the Response

Upon telling it that, I got this response:

> Apologies for the oversight. To infer the type correctly based on the shape of the input type, you can modify the FieldDefinition<T> type by using a generic function that captures the type of each property in the sort function. Here's an updated version:
> 
> ```ts
> type FieldDefinition<T> = Array<{
>   key: keyof T
>   label: string
>   sort: <K extends keyof T>(a: T[K], b: T[K]) => number
> }>
> ```

Skipping the rest of its explanation, this solution still has the same problem. It's a bit closer to the final solution but not quite there.

### Getting ~Closer~ Further?

I respond to ChatGPT and it says:

> Apologies for the confusion. To correctly infer the types inside the sort function based on the corresponding property types, you can update the FieldDefinition<T> type as follows:
> 
> ```ts
> type FieldDefinition<T> = Array<{
>   key: keyof T
>   label: string
>   sort: T[keyof T] extends string
>     ? (a: string, b: string) => number
>     : T[keyof T] extends number
>     ? (a: number, b: number) => number
>     : never
> }>
> ```

It's funny how apologetic ChatGPT can be sometimes. In this case it is rightfully so, because WOW is that wrong.
Not only does it cause the parameters of `sort` to always be `never` (because `string | number` *never* extends either `string` or `number`, only both at once), it's horribly complicated.

### The Final Solution

I tell ChatGPT that its solution is way too complicated, and I offer a bit of example code, acknowledging it is not valid but it is close to what I think the final solution should be:

> That type is too complicated, there is a more simple solution. Here is something close to what I want:
> 
> ```ts
> type FieldDefinition<T> = T extends { [infer K]: infer V } ? {
>   key: K
>   label: string
>   sort: (a: V, b: V) => number
> } : never
> ```
> 
> but that does not compile

I know the power of infer, though I already secretly knew it shouldn't be needed for the final solution (and it can't be used in an object key anyway). At this point ChatGPT finally got it:

> Apologies for the confusion. The syntax you provided is not valid TypeScript. However, we can achieve the desired result using mapped types and the keyof operator. Here's an updated version that should work:
> 
> ```ts
> type FieldDefinition<T> = {
>   [K in keyof T]: {
>     key: K
>     label: string
>     sort: (a: T[K], b: T[K]) => number
>   }
> }[keyof T]
> ```
> 
> In this version, we use a mapped type to iterate over the keys of T and create an object type for each key. Each object type has properties key of type K, label of type string, and sort of type (a: T[K], b: T[K]) => number. We then use [keyof T] to index into the mapped type and obtain a union of all the object types.

This works perfectly! And it gave a great explanation of why this works as well. When applied to `EbitSummary`, this type ends up being similar to (actually, identical to) the following type:

```ts
// FieldDefinition<EbitSummary>
type EbitSummaryFieldDefinition =
  {
    key: 'name',
    label: string,
    sort: (a: string, b: string) => number,
  } | {
    key: 'milesFromWarehouse',
    label: string,
    sort: (a: number, b: number) => number,
  }
```

Other than breaking down the equivalent union of types to help visualize it, I can't come up with a better explanation than ChatGPT's response.

## Conclusion

Overall this conversation took me about 15-20 minutes from start to finish. Honestly that's probably faster than I could have worked it out with a coworker.

I've used ChatGPT for several TypeScript puzzles at this point and it has been pretty useful. It's obvious you have to already know quite a bit about what you're doing to carry a proper conversation with ChatGPT,
where a real person might be able to better understand where your knowledge is lacking and try to ask clarifying questions to help get to the finish line. Overall I've been pretty impressed with ChatGPT and I find myself
going to it instead of StackOverflow more and more.
