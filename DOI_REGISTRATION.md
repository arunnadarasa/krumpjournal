# DOI Registration Guide

## About DOIs in Krump Journal

Articles submitted through Krump Journal receive a simulated DOI in the format:
```
10.KRUMPJOURNAL/article.{year}.{timestamp}
```

This DOI is stored in the article metadata on IPFS and Story blockchain, but it is **not yet registered** with a DOI Registration Agency.

## Registering Your DOI with Zenodo

To make your DOI resolvable and officially registered, you should register it through [Zenodo](https://zenodo.org/), a free and open-access research repository.

### Steps:

1. **Create a Zenodo Account**
   - Visit [https://zenodo.org/](https://zenodo.org/)
   - Sign up or log in

2. **Create a New Upload**
   - Go to [https://zenodo.org/uploads/new](https://zenodo.org/uploads/new)
   - Upload your article or link to the IPFS gateway URL

3. **Fill in Metadata**
   - Title: Your article title
   - Authors: Include ORCID iDs
   - Description: Your abstract
   - Keywords: Your article keywords
   - Add custom field for Story blockchain transaction hash

4. **Reserve DOI**
   - Zenodo will provide you with a DOI (e.g., `10.5281/zenodo.1234567`)
   - This DOI will be permanently linked to your article

5. **Update Your Article Record** (Future Feature)
   - You'll be able to update your Krump Journal article with the official Zenodo DOI
   - This creates a verifiable link between the Story blockchain record and the official DOI

## Why Register with Zenodo?

- **Free & Open**: No cost for researchers
- **Permanent**: DOIs are permanent identifiers
- **Discoverable**: Articles become findable in academic search engines
- **Citable**: Provides a standard citation format
- **Archived**: Long-term preservation guaranteed
- **Integration**: Works well with ORCID and other academic systems

## Current DOI Status

The simulated DOIs (`10.KRUMPJOURNAL/*`) serve as:
- Unique identifiers within the Krump Journal ecosystem
- Metadata stored on Story blockchain
- Placeholders until official DOI registration

For production use, we recommend integrating with Zenodo's API to automatically register DOIs upon article minting.
