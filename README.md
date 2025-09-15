# molequles-cf-worker

Repo housing Cloudflare Worker utilities for [Molequles](https://molequles.app) 

To run locally: 
```
npx wrangler dev
```

Deploy to CloudFlare:
```
npx wrangler deploy
```

## Routes

### `POST /normalize`

```
// request
{
  "input": "<formula text>"
}

// response
{
  "output": "<normalized formula text>"
}
```

Clean up and normalize formula text. Utilizes Workers AI to identify key components of a formula (material, weight, dilution) in the given input and normalize the formula to a specific format.

Input can be in all kinds of formats and can contain relevant and irrelevant data.

Example Input:
```
Fresh Citrus Cologne
Created by John Smith
A refreshing blend

Bergamot 7.5g
Lemon 5.0g
Petitgrain 10% 2.5g
Lavender 20% 10.0g (may be dosed too high)
Geranium 1% 4.0g
Vetiver 10% 6.0g
Iso E Super 2.5g
Perfumer's Alcohol 62.5g
TOTAL: 100g

Notes: Store in cool, dark place
```

Example output:
```
7.5 Bergamot (100%)
5.0 Lemon (100%)
2.5 Petitgrain (10%)
10.0 Lavender (20%)
4.0 Geranium (1%)
6.0 Vetiver (10%)
2.5 Iso E Super (100%)
62.5 Perfumer's Alcohol (100%)
```

Only relevant data is extracted, and the rows are normalized to `<weight> <name> <dilution>`
