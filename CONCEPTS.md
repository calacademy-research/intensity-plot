# Intensity Plot Concepts

The analysis employed evaluates samples against behavior observed (trait) and its occurrence (intensity)

The intensity grid captures a row for each entity, a column for the each distinct behavior, and  intensity as the cell value presented by color.  

The desire is to capture the overlaps between the samples. In effect, using aggregation functions to analyze and deduce relationships.  Groupings isolate sets.
Further, employing curve fitting techniques solve for statistical parameters.

![](docs\IntensityPlot-DataModel.png)

## Entity
The source of data obtained, e.g. a single spider's DNA

* Name, eg. `HiBiKi15-02`
* Additional metadata describing the sample. e.g. region/area of sample retrieval, sample instance number, `02`

##  Sample
Atomic unit of data to be evaluated, e.g. (allele length, occurrence).  These serve as inputs to visualization tool.

## Trait
Numerical description of a behavior we are observing, such as the length of an allele or deviation of temperature normals.

## Intensity
Numerical description of the occurence of the trait captured with the sample.

### Data Format
The goal of the data format is to describe each sample along with the information necessary to define the behavior and occurrence. 

* `Newline` delineated rows
* `Tab` delineated values for 
`identifier, trait, intensity` 

## Grouping
A set of samples, where samples can originate from multiple *entities*.

A grouping is a mechanism by which we compare samples to each other.  By evaluating different groupings, we can search for matches of behavior and occurrence across samples. 

Further this process can be automated and results interpolated to discover distribution patterns. 

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
  * the boundaries of the variables being observed, we can think of this as the definition of our axes. 
* Compare similarities across behavior and intensity
* Isolate entities through groupings
  
[See Automated Grouping](GROUPING.md)


