# Automated Grouping

Although we can visually identify patterns in the data, we can use mathematical analysis to solve for distribution variables and present visual verification.

## Lets take a closer look at the data we are visualizing

We will utilize an NPM package call [nano-sql](https://www.npmjs.com/package/nano-sql) to use SQL to group and analyze the data.

Consider the following data model:

|Sample Name | Behavior (Intensity)  | Occurrence of Behavior| 
|---|---|---|
|HiBiK15-01   | 161   | 1  |
|HiBiK15-02   | 156   | 11 | 
|HiBiK15-02   | 161   | 15 | 
...

Group by:
- Sample Name (total number)
    - Intensity
    - Occurence

