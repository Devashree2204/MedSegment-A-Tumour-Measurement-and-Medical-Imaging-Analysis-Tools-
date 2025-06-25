import '@testing-library/jest-dom';    // 1. register jest-dom matchers
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UploadMRI from './UploadMRI';

describe('UploadMRI component', () => {
  test('1. shows supported format text before file is selected', () => {
    render(<UploadMRI onPreviewUpdate={() => {}} />);
    expect(
      screen.getByText(/Supported format: \.nii\.gz/i)
    ).toBeInTheDocument();
  });

  test('2. updates info text after selecting a file', () => {
    render(<UploadMRI onPreviewUpdate={() => {}} />);

    const file = new File(['dummy'], 'scan.nii.gz', {
      type: 'application/octet-stream',
    });

    const input = document.querySelector('input[type="file"]');
    expect(input).toBeTruthy();               // assert existence

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText(/scan\.nii\.gz/i)).toBeInTheDocument();
  });

  test('3. clicking the button with a file calls onPreviewUpdate', async () => {
    const mockPreview = 'data:image/png;base64,ABC';
    const mockPrediction = 'Tumor';
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            preview: mockPreview,
            prediction: mockPrediction,
          }),
      })
    );

    const onPreviewUpdate = jest.fn();
    render(<UploadMRI onPreviewUpdate={onPreviewUpdate} />);

    const file = new File(['dummy'], 'scan.nii.gz');
    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [file] } });

    const btn = screen.getByRole('button');
    fireEvent.click(btn);

    await waitFor(() => {
      expect(
        screen.getByText(/Model is working, please wait/i)
      ).toBeInTheDocument();
    });

    expect(onPreviewUpdate).toHaveBeenCalledWith(
      mockPreview,
      mockPrediction,
      'scan.nii.gz'
    );
  });
});