#include <stdio.h>
/* print Fahrenheit-Celsius table
for fahr = 0, 20, ..., 300 */
main()
{
  float fahr;
  double celsius;
  int  upper, step;
  int lower;
  lower = 0; /* lower limit of temperature table */
  upper = 300; /* upper limit *1*/
  step = 20;  /* step size */

  fahr = upper;
  while (fahr >= lower) {
      celsius = 5 * (fahr-32) / 9;
      printf("%f\t%f\n", fahr, celsius);
      fahr = fahr - step;
  }
}
