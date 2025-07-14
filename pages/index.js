<button 
                  onClick={handleGenerateRunwayVideo}
                  disabled={isRetrieving}
                  style={{
                    padding: '12px 20px',
                    background: isRetrieving ? '#ccc' : '#8a2be2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isRetrieving ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    minWidth: '160px'
                  }}>
                  🟣 Professional Video (34 sec)
                  <br />
                  <small style={{ fontSize: '11px', opacity: 0.9 }}>Runway ML • $20-30 • 8-12 mins</small>
                </button>
