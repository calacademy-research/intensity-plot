# Automated Grouping

Although we can visually identify patterns in the data, we can use mathematical analysis to solve for distribution variables and present visual verification.

## Lets take a closer look at the data we are visualizing

We will utilize an NPM package,[nano-sql](https://www.npmjs.com/package/nano-sql) to utilize SQL for grouping and analysis.

Consider the following data model:

|Sample Identifier | Trait | Occurrence of Trait| 
|---|---|---|
|HiBiK15-01   | 161   | 1  |
|HiBiK15-02   | 156   | 11 | 
|HiBiK15-02   | 161   | 15 | 
...

And the following questions:

a. What are the traits (and intensity) for a single entity
b. What are the min and max intensities for each trait across all entities (range)
c. Which entities share traits (and intensities) 

### Data Model and SQL 

The above questions can be answered using SQL and grouping.