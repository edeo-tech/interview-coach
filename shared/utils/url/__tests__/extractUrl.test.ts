import { extractUrlFromText, isValidUrl, cleanJobUrl } from '../extractUrl';

describe('extractUrlFromText', () => {
  it('should return clean URLs as-is', () => {
    const cleanUrl = 'https://www.linkedin.com/jobs/view/1234567890';
    expect(extractUrlFromText(cleanUrl)).toBe(cleanUrl);
  });

  it('should extract URL from LinkedIn share text', () => {
    const linkedInShare = `Check out this job at Google: Software Engineer
https://www.linkedin.com/jobs/view/1234567890`;
    expect(extractUrlFromText(linkedInShare)).toBe('https://www.linkedin.com/jobs/view/1234567890');
  });

  it('should extract URL from text with multiple lines', () => {
    const multilineText = `
    Exciting opportunity!
    
    Software Developer Position
    Company: Tech Corp
    
    Apply here: https://careers.techcorp.com/jobs/dev-123
    
    Don't miss out!
    `;
    expect(extractUrlFromText(multilineText)).toBe('https://careers.techcorp.com/jobs/dev-123');
  });

  it('should handle URLs without protocol', () => {
    const noProtocol = 'linkedin.com/jobs/view/9876543210';
    expect(extractUrlFromText(noProtocol)).toBe('https://linkedin.com/jobs/view/9876543210');
  });

  it('should handle Indeed URLs', () => {
    const indeedShare = 'Backend Developer - Remote https://www.indeed.com/viewjob?jk=abc123def456';
    expect(extractUrlFromText(indeedShare)).toBe('https://www.indeed.com/viewjob?jk=abc123def456');
  });

  it('should ignore LinkedIn tracking URLs', () => {
    const withTracking = `
    Check this out: https://www.linkedin.com/comm/jobs/view/123456
    Actual job: https://www.linkedin.com/jobs/view/123456
    `;
    expect(extractUrlFromText(withTracking)).toBe('https://www.linkedin.com/jobs/view/123456');
  });

  it('should handle URLs with query parameters', () => {
    const withParams = 'Apply now: https://jobs.company.com/position?id=123&source=linkedin&utm_campaign=fall2024';
    expect(extractUrlFromText(withParams)).toBe('https://jobs.company.com/position?id=123&source=linkedin&utm_campaign=fall2024');
  });

  it('should return original text if no URL found', () => {
    const noUrl = 'This is just plain text without any URL';
    expect(extractUrlFromText(noUrl)).toBe(noUrl);
  });
});

describe('isValidUrl', () => {
  it('should validate correct URLs', () => {
    expect(isValidUrl('https://www.example.com')).toBe(true);
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('https://example.com/path/to/page')).toBe(true);
  });

  it('should reject invalid URLs', () => {
    expect(isValidUrl('not a url')).toBe(false);
    expect(isValidUrl('ftp://example.com')).toBe(false);
    expect(isValidUrl('example.com')).toBe(false);
    expect(isValidUrl('')).toBe(false);
  });
});

describe('cleanJobUrl', () => {
  it('should clean and validate LinkedIn share text', () => {
    const linkedInShare = `I'm hiring! Check out this amazing opportunity at our company:
    
    Senior Software Engineer
    https://www.linkedin.com/jobs/view/1234567890
    
    #hiring #softwarejobs`;
    
    const result = cleanJobUrl(linkedInShare);
    expect(result.url).toBe('https://www.linkedin.com/jobs/view/1234567890');
    expect(result.isValid).toBe(true);
  });

  it('should handle invalid input', () => {
    const result = cleanJobUrl('not a valid url at all');
    expect(result.url).toBe('not a valid url at all');
    expect(result.isValid).toBe(false);
  });
});