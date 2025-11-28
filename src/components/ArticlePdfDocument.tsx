import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import Html from 'react-pdf-html';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Times-Roman',
    fontSize: 11,
    lineHeight: 1.6,
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    borderBottom: '2px solid #333',
    paddingBottom: 15,
  },
  journalName: {
    fontSize: 10,
    letterSpacing: 2,
    color: '#666',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  authors: {
    fontSize: 12,
    color: '#555',
  },
  keywords: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginVertical: 15,
  },
  abstract: {
    fontStyle: 'italic',
    padding: 15,
    borderLeft: '3px solid #333',
    backgroundColor: '#f9f9f9',
    marginVertical: 20,
  },
  abstractTitle: {
    fontStyle: 'normal',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  content: {
    marginTop: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#666',
    borderTop: '1px solid #ccc',
    paddingTop: 10,
  },
});

interface ArticlePdfDocumentProps {
  title: string;
  authorName: string;
  orcidId?: string;
  keywords: string[];
  abstract: string;
  content: string;
  license: string;
}

export const ArticlePdfDocument: React.FC<ArticlePdfDocumentProps> = ({
  title,
  authorName,
  orcidId,
  keywords,
  abstract,
  content,
  license,
}) => {
  const htmlStylesheet = {
    h1: { fontSize: 16, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
    h2: { fontSize: 14, fontWeight: 'bold', marginTop: 18, marginBottom: 8 },
    h3: { fontSize: 12, fontWeight: 'bold', marginTop: 15, marginBottom: 6 },
    p: { marginBottom: 10, textAlign: 'justify' },
    strong: { fontWeight: 'bold' },
    em: { fontStyle: 'italic' },
    ul: { marginLeft: 20, marginBottom: 10 },
    ol: { marginLeft: 20, marginBottom: 10 },
    li: { marginBottom: 4 },
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.journalName}>KRUMP JOURNAL</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.authors}>
            {authorName}{orcidId ? ` (ORCID: ${orcidId})` : ''}
          </Text>
        </View>

        {keywords.length > 0 && (
          <Text style={styles.keywords}>
            <Text style={{ fontWeight: 'bold' }}>Keywords: </Text>
            {keywords.join(', ')}
          </Text>
        )}

        {abstract && (
          <View style={styles.abstract}>
            <Text style={styles.abstractTitle}>Abstract</Text>
            <Text>{abstract}</Text>
          </View>
        )}

        <View style={styles.content}>
          <Html stylesheet={htmlStylesheet}>{content}</Html>
        </View>

        <Text style={styles.footer}>
          © {new Date().getFullYear()} Krump Journal. Licensed under {license}
        </Text>
      </Page>
    </Document>
  );
};
