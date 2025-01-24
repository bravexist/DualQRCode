import { useState } from 'react'
import QRCode from 'qrcode'
import './App.css'

function App() {
  const [url1, setUrl1] = useState('')
  const [url2, setUrl2] = useState('')
  const [qrCodeData, setQrCodeData] = useState('')
  const [error, setError] = useState('')

  const generateDualQRCode = async () => {
    try {
      if (!url1 || !url2) {
        setError('Please enter both URLs')
        return
      }
      setError('')

      // Generate QR code data for both URLs
      const qr1Data = await QRCode.create(url1, {
        errorCorrectionLevel: 'H'
      })
      const qr2Data = await QRCode.create(url2, {
        errorCorrectionLevel: 'H'
      })

      const moduleCount = qr1Data.modules.size
      const cellSize = 8 // Size of each QR code cell in pixels
      const margin = 4 * cellSize // 4 cells margin
      const size = moduleCount * cellSize + 2 * margin

      // Create canvas for the merged QR code
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')

      // Fill background
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, size, size)

      // Draw QR code cells
      for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
          const cell1 = qr1Data.modules.get(row, col)
          const cell2 = qr2Data.modules.get(row, col)
          
          const x = col * cellSize + margin
          const y = row * cellSize + margin

          if (cell1 === cell2) {
            // If cells are the same, draw solid color
            ctx.fillStyle = cell1 ? '#000000' : '#FFFFFF'
            ctx.fillRect(x, y, cellSize, cellSize)
          } else {
            // If cells differ, create diagonal split pattern
            ctx.fillStyle = cell1 ? '#000000' : '#FFFFFF'
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(x + cellSize, y)
            ctx.lineTo(x + cellSize, y + cellSize)
            ctx.fill()

            ctx.fillStyle = cell2 ? '#000000' : '#FFFFFF'
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(x, y + cellSize)
            ctx.lineTo(x + cellSize, y + cellSize)
            ctx.fill()
          }
        }
      }

      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL('image/png')
      setQrCodeData(dataUrl)

      // No cleanup needed since we're using canvas directly
    } catch (err) {
      setError('Error generating QR code: ' + err.message)
    }
  }

  return (
    <div className="app-container">
      <h1>Dual-Link QR Code Generator</h1>
      <div className="input-container">
        <input
          type="url"
          placeholder="Enter first URL"
          value={url1}
          onChange={(e) => setUrl1(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              generateDualQRCode()
            }
          }}
        />
        <input
          type="url"
          placeholder="Enter second URL"
          value={url2}
          onChange={(e) => setUrl2(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              generateDualQRCode()
            }
          }}
        />
        <button onClick={generateDualQRCode}>Generate QR Code</button>
      </div>
      {error && <div className="error">{error}</div>}
      {qrCodeData && (
        <div className="qr-code-container">
          <img src={qrCodeData} alt="Dual QR Code" />
        </div>
      )}
      <p className="app-subtitle">Try scanning from different angles</p>
      <div className="footer">
        Inspired by <a href="https://mstdn.social/@isziaui/113874436953157913" target="_blank" rel="noopener noreferrer">Christian Walther</a>
      </div>
    </div>
  )
}

export default App
