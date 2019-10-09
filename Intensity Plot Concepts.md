# Intensity Plot Concepts

A JavaScript tool to visualize and discover patterns across sample sets.  

The analysis employed evaluates samples against behavior observed and its occurrence (intensity)

The intensity grid captures a row for each entity, a column for the each distinct behavior, and  intensity as the cell value presented by color.  

The desire is to capture the overlaps between the samples. In effect, using aggregation functions to analyze and deduce relationships.  Groupings isolate sets.
Futher, employing curve fitting techniques solve for stastical parameters.

 [Data Model](docs\IntensityPlot-DataModel.png)

## Entity
The source of data obtained, e.g. a single spider's DNA

#### Attributes
* Unique identifer, eg. `HiBiKi15-02`
* Additional metadata describing the sample. e.g. region/area of sample retrieval, sample instance number, `02`

## Sample
Atomic unit of data to be evaluated, e.g. (bhavior, intensity).  These serve as inputs to visualization tool.

## Sample Set
A collection of samples related to an entity.

### Data Format
The goal of the data format is to describe each sample along with the information necessary to define the behavior and occurrence. 

* `Newline` deliminated rows
* `Tab` deliminated vaules for 
`identifier, variable observed, number of observations` 

## Grouping
A set of samples, where samples can originate from multiple *sample sets*.

A grouping is a mechanism by which we compare samples to each other.  By evaluating different groupings, we can search for matches of behavior and occurrence accross samples. 

Futher this process can be automated and results interpolated to discover distribution patterns. 

## Grouping Function
An aggregator (function) evaluated against a group of samples.  
This enables interpolation and distribution analysis.

For example, the aggregator could be an average of occurrences for each behavior. 

### Available Functions

* Average
* 


# Under the hood

## Processing Data

Given a set of samples:


e.g.
```
1	>HiBiK15-01	161
11	>HiBiK15-02	156
15	>HiBiK15-02	161
161	>HiBiK15-02	144
17	>HiBiK15-02	146

```

* Establish the distinct set of entities (e.g. entity: = `"HiBiK15-01"`)
* Evaluate all samples to define
  * the boundaries of the variable being observed, we can think of this as the definition of our axes. 
* Define the 
* 


