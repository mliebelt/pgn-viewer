## How to cut (and later change level of variation)

These are the notices during implementing the cut operation necessary in the edit mode.

These are the jobs to define here:

* What does cut mean for the pgn moves? So what will change in the structure?
* What is the structure of the moves, anyway?

### Structure of moves

* The reader gives me a long list of all moves.
* Each move has
    * The notation
    * The variation level it is on (normally 0)
    * An array of arrays of variations
    * next: index of the next move
    * prev: index of the previous move
  
So cutting a move does not mean to remove the move altogether, but to cut the first link to it (and from there
the backlink.

There are 2 cases relevant:

1. Move as part of the main variation, or not the first move of a variation
  ==> cut there all rest moves of that line, or just cut the first reference, that means, the next of the prev move.
2. Move as the first move of a variation
  ==> remove the whole variation
  
Sometimes it is tricky to find the move where the reference has to be destroyed. Take that example:
  
3. Bc4 Bc5 (3... Nf6 4. 0-0 Nxe4)
    
The numbers here are:

* Bc4: 0
* Bc5: 1
* Nf6: 2

To remove Nf6 (as variation), you have to cut the variation of the prev move Bc4

So what are all cases relevant:

* Same variation level as the prev move ==> Move in a row, so just cut it
    * Set in the prev move the next move to nil
* +1 variation level to the prev move ==> First move of a variation
    * Find the main move of that variation.
    * Identify the variation (that one that starts with the move)
    * Delete that whole array. Nothing else to do, because move is NOT the next move to some prev
* -1 variation level ==> Cannot happen
    
### How to recompute view of the moves?    